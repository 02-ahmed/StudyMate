"use client";

import { useState, useEffect } from "react";
import QuestionDisplay from "../components/questions/QuestionDisplay"; // Import the new component

export default function UploadContent() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractionMode, setExtractionMode] = useState("manual"); // "manual" or "ai"
  const [examName, setExamName] = useState("");
  const [examYear, setExamYear] = useState("");
  const [examCountry, setExamCountry] = useState(""); // New state for exam country
  const [isGlobalExam, setIsGlobalExam] = useState(false); // New state for global exam
  const [examSchool, setExamSchool] = useState(""); // New state for exam school
  const [examSubject, setExamSubject] = useState(""); // New state for exam subject/course
  const [examType, setExamType] = useState(""); // New state for exam type
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Simplified state for exam management
  const [showExamManager, setShowExamManager] = useState(false);
  const [exams, setExams] = useState([]);
  const [selectedExams, setSelectedExams] = useState(new Set());
  const [deletingExams, setDeletingExams] = useState(false);

  // Fetch all exams on component mount
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/getExams");
      if (response.ok) {
        const data = await response.json();
        setExams(data.exams || []);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const handleExamSelection = (examId) => {
    const newSelected = new Set(selectedExams);
    if (newSelected.has(examId)) {
      newSelected.delete(examId);
    } else {
      newSelected.add(examId);
    }
    setSelectedExams(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedExams.size === exams.length) {
      setSelectedExams(new Set());
    } else {
      setSelectedExams(new Set(exams.map((e) => e.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedExams.size === 0) {
      setMessage("Please select exams to delete.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedExams.size} exam(s)? This will remove ALL questions from these exams.`
      )
    ) {
      return;
    }

    setDeletingExams(true);
    try {
      const response = await fetch("/api/deleteExams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examIds: Array.from(selectedExams),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`Successfully deleted ${selectedExams.size} exam(s).`);
        setSelectedExams(new Set());
        // Refresh the exams list
        fetchExams();
      } else {
        setMessage(data.error || "Failed to delete exams.");
      }
    } catch (error) {
      console.error("Error deleting exams:", error);
      setMessage("An error occurred while deleting exams.");
    } finally {
      setDeletingExams(false);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleExtractionModeChange = (event) => {
    setExtractionMode(event.target.value);
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

    // Validation based on extraction mode
    if (!selectedFile) {
      setMessage("Please select an exam script file.");
      setLoading(false);
      return;
    }

    if (extractionMode === "manual") {
      if (!examName || !examYear || !examCountry || !examSubject) {
        setMessage(
          "Please fill in all required fields (Exam Name, Year, Country, and Subject)."
        );
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append("examScript", selectedFile);
    formData.append("extractionMode", extractionMode);
    formData.append("examName", examName);
    formData.append("examYear", examYear);
    formData.append("examCountry", examCountry);
    formData.append("isGlobalExam", isGlobalExam);
    formData.append("examSchool", examSchool);
    formData.append("examSubject", examSubject);
    formData.append("examType", examType);

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
        setExamCountry("");
        setIsGlobalExam(false);
        setExamSchool("");
        setExamSubject("");
        setExamType("");
        // Refresh exams list after successful upload
        fetchExams();
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
        maxWidth: "1200px",
        margin: "auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Upload Past Question Paper</h1>

      {/* Exam Manager Toggle */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setShowExamManager(!showExamManager)}
          style={{
            padding: "10px 20px",
            backgroundColor: showExamManager ? "#dc3545" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          {showExamManager ? "Hide Exam Manager" : "Show Exam Manager"}
        </button>
      </div>

      {/* Exam Manager Section */}
      {showExamManager && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "30px",
            backgroundColor: "#f8f9fa",
          }}
        >
          <h2 style={{ marginBottom: "20px", color: "#333" }}>Exam Manager</h2>

          {exams.length > 0 ? (
            <div>
              {/* Action Buttons */}
              <div
                style={{ marginBottom: "15px", display: "flex", gap: "10px" }}
              >
                <button
                  onClick={handleSelectAll}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  {selectedExams.size === exams.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedExams.size === 0 || deletingExams}
                  style={{
                    padding: "8px 16px",
                    backgroundColor:
                      selectedExams.size === 0 ? "#6c757d" : "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                      selectedExams.size === 0 ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    opacity: selectedExams.size === 0 ? 0.6 : 1,
                  }}
                >
                  {deletingExams
                    ? "Deleting..."
                    : `Delete Selected (${selectedExams.size})`}
                </button>
              </div>

              {/* Exams List */}
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      padding: "15px",
                      marginBottom: "10px",
                      backgroundColor: "white",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedExams.has(exam.id)}
                      onChange={() => handleExamSelection(exam.id)}
                      style={{ marginTop: "3px" }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: "bold", marginBottom: "5px" }}>
                        {exam.name} ({exam.year})
                      </p>
                      <p
                        style={{
                          marginBottom: "5px",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      >
                        <strong>Subject:</strong> {exam.course}
                      </p>
                      <p
                        style={{
                          marginBottom: "5px",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      >
                        <strong>Country:</strong> {exam.country}
                      </p>
                      <p
                        style={{
                          marginBottom: "5px",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      >
                        <strong>Total Questions:</strong>{" "}
                        {exam.total_questions || 0}
                      </p>
                      <p
                        style={{
                          marginBottom: "5px",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      >
                        <strong>Date Added:</strong>{" "}
                        {new Date(
                          exam.date_added._seconds * 1000
                        ).toLocaleDateString()}
                      </p>
                      {exam.school && (
                        <p
                          style={{
                            marginBottom: "5px",
                            fontSize: "14px",
                            color: "#666",
                          }}
                        >
                          <strong>School:</strong> {exam.school}
                        </p>
                      )}
                      {exam.type && (
                        <p
                          style={{
                            marginBottom: "5px",
                            fontSize: "14px",
                            color: "#666",
                          }}
                        >
                          <strong>Type:</strong> {exam.type}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>No exams found. Upload some exams first!</p>
          )}
        </div>
      )}

      {/* Extraction Mode Selection */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}
        >
          Extraction Mode:
        </label>
        <div style={{ display: "flex", gap: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <input
              type="radio"
              name="extractionMode"
              value="manual"
              checked={extractionMode === "manual"}
              onChange={handleExtractionModeChange}
            />
            Manual Mode (I provide metadata)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <input
              type="radio"
              name="extractionMode"
              value="ai"
              checked={extractionMode === "ai"}
              onChange={handleExtractionModeChange}
            />
            AI Extraction Mode (AI extracts everything from document)
          </label>
        </div>
      </div>

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
        {/* File Upload */}
        <div>
          <label
            htmlFor="examScript"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Exam Script (PDF/Image):
          </label>
          <input
            type="file"
            id="examScript"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
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

        {/* Manual Mode Fields - Only show if manual mode is selected */}
        {extractionMode === "manual" && (
          <>
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
          </>
        )}

        {/* AI Extraction Mode Fields (if AI mode is selected) */}
        {extractionMode === "ai" && (
          <div>
            <p>
              In AI Extraction Mode, the system will attempt to extract all
              relevant information from the uploaded document. This might
              include exam names, years, countries, schools, subjects, and
              types. You may need to provide a more specific exam name and year
              if the AI cannot determine them accurately.
            </p>
            <p>
              <strong>Note:</strong> AI extraction is an experimental feature
              and might not be perfect. You may need to manually adjust the
              extracted data if the AI&apos;s predictions are incorrect.
            </p>
          </div>
        )}

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
            backgroundColor:
              message.includes("successful") || message.includes("Successfully")
                ? "#d4edda"
                : "#f8d7da",
            color:
              message.includes("successful") || message.includes("Successfully")
                ? "#155724"
                : "#721c24",
            border: `1px solid ${
              message.includes("successful") || message.includes("Successfully")
                ? "#c3e6cb"
                : "#f5c6cb"
            }`,
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
