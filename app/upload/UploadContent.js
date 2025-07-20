"use client";

import { useState } from "react";

export default function UploadContent() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [examName, setExamName] = useState("");
  const [examYear, setExamYear] = useState("");
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!selectedFile || !examName || !examYear) {
      setMessage("Please fill in all fields.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("examScript", selectedFile);
    formData.append("examName", examName);
    formData.append("examYear", examYear);

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
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Upload Past Question Paper</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div>
          <label
            htmlFor="examName"
            style={{ display: "block", marginBottom: "5px" }}
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
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            required
          />
        </div>
        <div>
          <label
            htmlFor="examYear"
            style={{ display: "block", marginBottom: "5px" }}
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
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            required
          />
        </div>
        <div>
          <label
            htmlFor="examScript"
            style={{ display: "block", marginBottom: "5px" }}
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
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 15px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Uploading..." : "Upload Exam"}
        </button>
      </form>
      {message && (
        <p
          style={{
            marginTop: "20px",
            color: message.includes("successful") ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
