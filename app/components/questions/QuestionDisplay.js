"use client";

import { useState } from "react";

export default function QuestionDisplay({ question }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <li style={{ marginBottom: "10px" }}>
      <p>
        <strong>Q{question.question_number_in_exam}:</strong>{" "}
        {question.question_text}
      </p>
      {question.options && question.options.length > 0 && (
        <ul style={{ listStyleType: "lower-alpha", paddingLeft: "20px" }}>
          {question.options.map((option, idx) => (
            <li key={idx}> {option}</li>
          ))}
        </ul>
      )}
      {question.correct_answer && (
        <div>
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            style={{
              background: "none",
              border: "1px solid #0070f3",
              color: "#0070f3",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.8em",
              marginTop: "5px",
            }}
          >
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </button>
          {showAnswer && (
            <p style={{ fontWeight: "bold", color: "green", marginTop: "5px" }}>
              Correct Answer: {question.correct_answer}
            </p>
          )}
        </div>
      )}
      {question.explanation && (
        <p style={{ fontSize: "0.9em", color: "#666" }}>
          Explanation: {question.explanation}
        </p>
      )}
    </li>
  );
}
