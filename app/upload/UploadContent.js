"use client";

import { useState, useEffect } from "react";
import QuestionDisplay from "../components/questions/QuestionDisplay"; // Import the new component

export default function UploadContent() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [examName, setExamName] = useState("");
  const [examYear, setExamYear] = useState("");
  const [examCountry, setExamCountry] = useState(""); // New state for exam country
  const [isGlobalExam, setIsGlobalExam] = useState(false); // New state for global exam
  const [examSchool, setExamSchool] = useState(""); // New state for exam school
  const [examSubject, setExamSubject] = useState(""); // New state for exam subject/course
  const [examType, setExamType] = useState(""); // New state for exam type
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [exams, setExams] = useState([]);
  const [fetchingExams, setFetchingExams] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const fetchExams = async () => {
    setFetchingExams(true);
    setFetchError("");
    try {
      const response = await fetch("/api/getExams");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setExams(data.exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setFetchError("Failed to load exams. Please try again.");
    } finally {
      setFetchingExams(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []); // Run once on component mount

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleExamNameChange = (event) => {
    setExamName(event.target.value);
  };

  const handleExamYearChange = (event) => {
    setExamYear(event.target.value);
  };

  const handleExamCountryChange = (event) => {
    setExamCountry(event.target.value);
  };

  const handleIsGlobalExamChange = (event) => {
    setIsGlobalExam(event.target.checked);
  };

  const handleExamSchoolChange = (event) => {
    setExamSchool(event.target.value);
  };

  const handleExamSubjectChange = (event) => {
    setExamSubject(event.target.value);
  };

  const handleExamTypeChange = (event) => {
    setExamType(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (
      !selectedFile ||
      !examName ||
      !examYear ||
      !examCountry ||
      !examSubject
    ) {
      // Added examSubject to validation
      setMessage(
        "Please fill in all required fields (Exam Script, Name, Year, Country, and Subject)."
      );
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("examScript", selectedFile);
    formData.append("examName", examName);
    formData.append("examYear", examYear);
    formData.append("examCountry", examCountry);
    formData.append("isGlobalExam", isGlobalExam);
    formData.append("examSchool", examSchool);
    formData.append("examSubject", examSubject); // Append new field
    formData.append("examType", examType); // Append new field

    try {
      const response = await fetch("/api/ingest-exam", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Upload successful!");
        setSelectedFile(null);
        setExamName("");
        setExamYear("");
        setExamCountry(""); // Clear new field
        setIsGlobalExam(false); // Clear new field
        setExamSchool(""); // Clear new field
        setExamSubject(""); // Clear new field
        setExamType(""); // Clear new field
        fetchExams(); // Re-fetch exams after successful upload
      } else {
        setMessage(data.error || "Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading exam script:", error);
      setMessage("An error occurred during upload. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Upload Past Question Paper</h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginBottom: "30px",
          border: "1px solid #eee",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <label
            htmlFor="examName"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Exam Name:
          </label>
          <input
            type="text"
            id="examName"
            value={examName}
            onChange={handleExamNameChange}
            placeholder="e.g., Ghana Law Entrance Exams"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
            required
          />
        </div>
        <div>
          <label
            htmlFor="examYear"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Exam Year:
          </label>
          <input
            type="text"
            id="examYear"
            value={examYear}
            onChange={handleExamYearChange}
            placeholder="e.g., 2016/2017"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
            required
          />
        </div>
        <div>
          <label
            htmlFor="examCountry"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Exam Country:
          </label>
          <input
            type="text"
            id="examCountry"
            value={examCountry}
            onChange={handleExamCountryChange}
            placeholder="e.g., Ghana"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
            required
          />
        </div>
        <div>
          <input
            type="checkbox"
            id="isGlobalExam"
            checked={isGlobalExam}
            onChange={handleIsGlobalExamChange}
            style={{ marginRight: "10px" }}
          />
          <label htmlFor="isGlobalExam" style={{ fontWeight: "bold" }}>
            Is this a global exam?
          </label>
        </div>
        <div>
          <label
            htmlFor="examSchool"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Exam School (Optional):
          </label>
          <input
            type="text"
            id="examSchool"
            value={examSchool}
            onChange={handleExamSchoolChange}
            placeholder="e.g., University of Ghana"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div>
          <label
            htmlFor="examSubject"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Exam Subject/Course:
          </label>
          <input
            type="text"
            id="examSubject"
            value={examSubject}
            onChange={handleExamSubjectChange}
            placeholder="e.g., Law, Mathematics, Physics"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
            required
          />
        </div>
        <div>
          <label
            htmlFor="examType"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Exam Type (Optional):
          </label>
          <input
            type="text"
            id="examType"
            value={examType}
            onChange={handleExamTypeChange}
            placeholder="e.g., Midterm, Final Exam, Quiz"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div>
          <label
            htmlFor="examScript"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Exam Script (PDF or Image):
          </label>
          <input
            type="file"
            id="examScript"
            accept=".pdf,image/*"
            onChange={handleFileChange}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {loading ? "Uploading..." : "Upload Exam"}
        </button>
      </form>
      {message && (
        <p
          style={{
            marginTop: "20px",
            padding: "10px",
            borderRadius: "4px",
            backgroundColor: message.includes("successful")
              ? "#d4edda"
              : "#f8d7da",
            color: message.includes("successful") ? "#155724" : "#721c24",
            border: `1px solid ${
              message.includes("successful") ? "#c3e6cb" : "#f5c6cb"
            }`,
          }}
        >
          {message}
        </p>
      )}

      <h2
        style={{
          marginTop: "40px",
          marginBottom: "20px",
          borderBottom: "2px solid #0070f3",
          paddingBottom: "10px",
        }}
      >
        Uploaded Exams
      </h2>
      {fetchingExams && <p>Loading exams...</p>}
      {fetchError && <p style={{ color: "red" }}>{fetchError}</p>}
      {!fetchingExams && exams.length === 0 && !fetchError && (
        <p>No exams uploaded yet.</p>
      )}

      {!fetchingExams && exams.length > 0 && (
        <div style={{ display: "grid", gap: "20px" }}>
          {exams.map((exam) => (
            <div
              key={exam.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                backgroundColor: "#fff",
              }}
            >
              <h3 style={{ color: "#0070f3", marginBottom: "10px" }}>
                {exam.name} ({exam.year})
              </h3>
              <p>
                <strong>Course:</strong> {exam.course || "N/A"}
              </p>
              <p>
                <strong>Country:</strong> {exam.country || "N/A"}
              </p>
              <p>
                <strong>Total Questions:</strong> {exam.total_questions}
              </p>
              <p>
                <strong>Date Added:</strong>{" "}
                {new Date(exam.date_added._seconds * 1000).toLocaleString()}
              </p>

              {exam.sections && exam.sections.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <h4
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "5px",
                      marginBottom: "15px",
                      color: "#333",
                    }}
                  >
                    Sections:
                  </h4>
                  {exam.sections.map((section) => (
                    <div
                      key={section.id}
                      style={{
                        borderLeft: "3px solid #0070f3",
                        paddingLeft: "15px",
                        marginBottom: "15px",
                        backgroundColor: "#f9f9f9",
                        borderRadius: "4px",
                        padding: "15px",
                      }}
                    >
                      <p>
                        <strong>Section Name:</strong> {section.section_name} (
                        {section.section_number})
                      </p>
                      <p>
                        <strong>Question Type:</strong>{" "}
                        {section.question_type_in_section}
                      </p>
                      <p>
                        <strong>Instructions:</strong> {section.instructions}
                      </p>
                      <p>
                        <strong>Questions in Section:</strong>{" "}
                        {section.num_questions_in_section}
                      </p>

                      {section.questions && section.questions.length > 0 && (
                        <div style={{ marginTop: "15px" }}>
                          <h5 style={{ marginBottom: "10px", color: "#555" }}>
                            Questions:
                          </h5>
                          <ol style={{ paddingLeft: "20px" }}>
                            {section.questions.map((question) => (
                              <QuestionDisplay
                                key={question.id}
                                question={question}
                              />
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
