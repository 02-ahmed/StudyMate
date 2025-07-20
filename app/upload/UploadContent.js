"use client";

import { useState } from "react";
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
    </div>
  );
}
