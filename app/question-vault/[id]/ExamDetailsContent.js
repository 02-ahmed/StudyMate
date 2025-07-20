"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ExamDetailsContent({ examId }) {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shownAnswers, setShownAnswers] = useState({}); // Track shown answers by question ID
  const [aiAnswers, setAiAnswers] = useState({}); // Store AI answers by question ID
  const [aiLoading, setAiLoading] = useState({}); // Store loading state by question ID
  const [aiError, setAiError] = useState({}); // Store error state by question ID
  const [showAiAnswer, setShowAiAnswer] = useState({}); // Track visibility of AI answer per question

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/getExamDetails/${examId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setExam(data.exam);
      } catch (err) {
        console.error("Error fetching exam details:", err);
        setError("Failed to load exam details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExamDetails();
    }
  }, [examId]);

  const toggleShowAnswer = (questionId) => {
    setShownAnswers((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const formatQuestionType = (type) => {
    if (!type) return "";
    // Replace underscores with spaces, capitalize each word
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const fetchAiAnswer = async (question, section, exam, questionId) => {
    setAiLoading((prev) => ({ ...prev, [questionId]: true }));
    setAiError((prev) => ({ ...prev, [questionId]: null }));
    try {
      const response = await fetch("/api/ai-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: question.question_text,
          sectionName: section.section_name,
          examName: exam.name,
          examYear: exam.year,
        }),
      });
      if (!response.ok) throw new Error("Failed to get AI answer");
      const data = await response.json();
      setAiAnswers((prev) => ({ ...prev, [questionId]: data.answer }));
      setShowAiAnswer((prev) => ({ ...prev, [questionId]: true })); // Show AI answer after fetching
    } catch (err) {
      setAiError((prev) => ({
        ...prev,
        [questionId]: "Failed to get AI answer. Please try again.",
      }));
    } finally {
      setAiLoading((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleHideAiAnswer = (questionId) => {
    setShowAiAnswer((prev) => ({ ...prev, [questionId]: false }));
  };

  const handleFindAiAnswer = (question, section, exam, questionId) => {
    if (aiAnswers[questionId]) {
      setShowAiAnswer((prev) => ({ ...prev, [questionId]: true }));
    } else {
      fetchAiAnswer(question, section, exam, questionId);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Loading exam details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
        <p>{error}</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Exam not found.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "900px",
        margin: "auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f9fafb",
        borderRadius: "12px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        marginTop: "30px",
        marginBottom: "50px",
      }}
    >
      <Link href="/question-vault" passHref style={{ textDecoration: "none" }}>
        <button
          style={{
            marginBottom: "25px",
            padding: "8px 22px",
            borderRadius: "6px",
            border: "none",
            background: "#2b6cb0",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1em",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(44,62,80,0.08)",
            transition: "background 0.2s",
          }}
        >
          ← Back to Question Vault
        </button>
      </Link>
      <h1
        style={{
          textAlign: "center",
          color: "#1a202c",
          marginBottom: "20px",
          fontSize: "2.2em",
          fontWeight: "700",
        }}
      >
        {exam.name} ({exam.year})
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "30px",
          paddingBottom: "20px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <p style={{ color: "#4a5568" }}>
          <span style={{ fontWeight: "600" }}>Subject:</span> {exam.course}
        </p>
        <p style={{ color: "#4a5568" }}>
          <span style={{ fontWeight: "600" }}>Country:</span> {exam.country}
        </p>
        {exam.type && (
          <p style={{ color: "#4a5568" }}>
            <span style={{ fontWeight: "600" }}>Type:</span> {exam.type}
          </p>
        )}
        {exam.school && (
          <p style={{ color: "#4a5568" }}>
            <span style={{ fontWeight: "600" }}>School:</span> {exam.school}
          </p>
        )}
        <p style={{ color: "#4a5568" }}>
          <span style={{ fontWeight: "600" }}>Global:</span>{" "}
          {exam.is_global ? "Yes" : "No"}
        </p>
        <p style={{ color: "#4a5568" }}>
          <span style={{ fontWeight: "600" }}>Total Questions:</span>{" "}
          {exam.total_questions}
        </p>
        <p style={{ color: "#4a5568" }}>
          <span style={{ fontWeight: "600" }}>Date Added:</span>{" "}
          {new Date(exam.date_added._seconds * 1000).toLocaleDateString()}
        </p>
      </div>

      <h2
        style={{
          color: "#1a202c",
          marginBottom: "20px",
          fontSize: "1.8em",
          fontWeight: "600",
          borderBottom: "2px solid #a0aec0",
          paddingBottom: "10px",
        }}
      >
        Exam Sections
      </h2>

      {exam.sections && exam.sections.length > 0 ? (
        exam.sections.map((section) => (
          <div
            key={section.id}
            style={{
              marginBottom: "30px",
              padding: "20px",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            <h3
              style={{
                color: "#2b6cb0",
                marginBottom: "10px",
                fontSize: "1.5em",
              }}
            >
              {section.section_name || `Section ${section.section_number}`}
            </h3>
            {section.instructions && (
              <p style={{ color: "#4a5568", marginBottom: "15px" }}>
                <span style={{ fontWeight: "600" }}>Instructions:</span>{" "}
                {section.instructions}
              </p>
            )}
            {section.question_type_in_section && (
              <p style={{ color: "#4a5568", marginBottom: "15px" }}>
                <span style={{ fontWeight: "600" }}>Question Type:</span>{" "}
                {formatQuestionType(section.question_type_in_section)}
              </p>
            )}

            {section.questions && section.questions.length > 0 ? (
              section.questions.map((question) => {
                const hasAnswer =
                  !!question.correct_answer || !!question.explanation;
                return (
                  <div
                    key={question.id}
                    style={{
                      borderTop: "1px dashed #e2e8f0",
                      paddingTop: "20px",
                      marginTop: "20px",
                    }}
                  >
                    <p
                      style={{
                        color: "#2d3748",
                        fontWeight: "600",
                        marginBottom: "10px",
                      }}
                    >
                      Question {question.question_number_in_exam}:{" "}
                      {question.question_text}
                    </p>
                    {question.options && question.options.length > 0 && (
                      <ul
                        style={{
                          listStyleType: "none",
                          paddingLeft: "0",
                          marginBottom: "10px",
                        }}
                      >
                        {question.options.map((option, idx) => (
                          <li
                            key={idx}
                            style={{ marginBottom: "5px", color: "#4a5568" }}
                          >
                            {String.fromCharCode(65 + idx)}. {option}
                          </li>
                        ))}
                      </ul>
                    )}
                    {hasAnswer ? (
                      <>
                        <button
                          onClick={() => toggleShowAnswer(question.id)}
                          style={{
                            margin: "10px 0 0 0",
                            padding: "7px 18px",
                            borderRadius: "6px",
                            border: "none",
                            background: shownAnswers[question.id]
                              ? "#2b6cb0"
                              : "#4a5568",
                            color: "#fff",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "1em",
                            transition: "background 0.2s",
                          }}
                        >
                          {shownAnswers[question.id]
                            ? "Hide Answer"
                            : "Show Answer"}
                        </button>
                        {shownAnswers[question.id] && (
                          <div
                            style={{
                              marginTop: "12px",
                              padding: "12px",
                              background: "#f1f5f9",
                              borderRadius: "6px",
                            }}
                          >
                            {question.correct_answer && (
                              <p
                                style={{
                                  color: "#38a169",
                                  fontWeight: "600",
                                  marginBottom: "5px",
                                }}
                              >
                                Correct Answer: {question.correct_answer}
                              </p>
                            )}
                            {question.explanation && (
                              <p
                                style={{ color: "#4a5568", fontSize: "0.95em" }}
                              >
                                <span style={{ fontWeight: "600" }}>
                                  Explanation:
                                </span>{" "}
                                {question.explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "12px",
                          background: "#f1f5f9",
                          borderRadius: "6px",
                        }}
                      >
                        <p style={{ color: "#718096", marginBottom: "8px" }}>
                          No answer or explanation available.
                        </p>
                        <div>
                          {aiAnswers[question.id] &&
                          showAiAnswer[question.id] ? (
                            <div
                              style={{
                                marginTop: "8px",
                                background: "#fffbe6",
                                border: "1px solid #ffe58f",
                                borderRadius: "6px",
                                padding: "10px",
                              }}
                            >
                              <p
                                style={{
                                  color: "#b7791f",
                                  fontWeight: 600,
                                  marginBottom: "6px",
                                }}
                              >
                                AI-Generated Answer:
                              </p>
                              <div
                                style={{
                                  color: "#4a5568",
                                  marginBottom: "8px",
                                }}
                              >
                                {aiAnswers[question.id]}
                              </div>
                              <div
                                style={{ color: "#b7791f", fontSize: "0.93em" }}
                              >
                                <b>Note:</b> This answer was generated by AI and
                                may not be fully accurate. Please double-check
                                before relying on it.
                              </div>
                              <button
                                onClick={() => handleHideAiAnswer(question.id)}
                                style={{
                                  marginTop: "10px",
                                  background: "#4a5568",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "5px",
                                  padding: "5px 14px",
                                  fontWeight: 600,
                                  fontSize: "0.97em",
                                  cursor: "pointer",
                                }}
                              >
                                Hide AI Answer
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  handleFindAiAnswer(
                                    question,
                                    section,
                                    exam,
                                    question.id
                                  )
                                }
                                disabled={aiLoading[question.id]}
                                style={{
                                  background: "#f6ad55",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "5px",
                                  padding: "6px 16px",
                                  fontWeight: 600,
                                  fontSize: "0.97em",
                                  cursor: aiLoading[question.id]
                                    ? "not-allowed"
                                    : "pointer",
                                  marginTop: "4px",
                                }}
                              >
                                {aiLoading[question.id]
                                  ? "Finding answer..."
                                  : "Find Answer with AI"}
                              </button>
                              {aiError[question.id] && (
                                <div
                                  style={{ color: "#e53e3e", marginTop: "6px" }}
                                >
                                  {aiError[question.id]}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p style={{ color: "#718096" }}>
                No questions available for this section.
              </p>
            )}
          </div>
        ))
      ) : (
        <p style={{ color: "#718096" }}>No sections available for this exam.</p>
      )}
    </div>
  );
}
