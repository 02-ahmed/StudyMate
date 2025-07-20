"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; // Import Link for navigation

export default function QuestionVaultContent() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("");
  const [year, setYear] = useState("");
  const [country, setCountry] = useState("");
  const [isGlobal, setIsGlobal] = useState(false);
  const [school, setSchool] = useState("");

  // Unique filter options
  const [subjects, setSubjects] = useState([]);
  const [types, setTypes] = useState([]);
  const [years, setYears] = useState([]);
  const [countries, setCountries] = useState([]);
  const [schools, setSchools] = useState([]);

  // Fetch all exams for filter options on mount
  useEffect(() => {
    const fetchAllExams = async () => {
      try {
        const response = await fetch("/api/getPastQuestions");
        if (!response.ok) throw new Error("Failed to fetch exams for filters");
        const data = await response.json();
        const allExams = data.exams || [];
        setSubjects([
          ...new Set(allExams.map((e) => e.course).filter(Boolean)),
        ]);
        setTypes([...new Set(allExams.map((e) => e.type).filter(Boolean))]);
        setYears([...new Set(allExams.map((e) => e.year).filter(Boolean))]);
        setCountries([
          ...new Set(allExams.map((e) => e.country).filter(Boolean)),
        ]);
        setSchools([...new Set(allExams.map((e) => e.school).filter(Boolean))]);
      } catch (err) {
        // fallback: leave options empty
      }
    };
    fetchAllExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        ...(subject && { subject }),
        ...(type && { type }),
        ...(year && { year }),
        ...(country && { country }),
        ...(isGlobal && { isGlobal: true }),
        ...(school && { school }),
      }).toString();

      const response = await fetch(`/api/getPastQuestions?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setExams(data.exams);
    } catch (err) {
      console.error("Error fetching exams:", err);
      setError("Failed to load past questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Only fetch exams when a filter changes
  useEffect(() => {
    fetchExams();
  }, [subject, type, year, country, isGlobal, school]);

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
  };

  const handleIsGlobalChange = (event) => {
    setIsGlobal(event.target.checked);
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f9fafb",
        borderRadius: "12px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        marginTop: "30px",
        marginBottom: "50px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#1a202c",
          marginBottom: "30px",
          fontSize: "2.5em",
          fontWeight: "700",
        }}
      >
        Question Vault
      </h1>

      <div
        style={{
          marginBottom: "18px",
          padding: "10px 12px",
          border: "1px solid #e2e8f0",
          borderRadius: "7px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{
              width: 110,
              fontSize: "0.95em",
              padding: "4px 7px",
              borderRadius: 4,
              border: "1px solid #cbd5e0",
            }}
          >
            <option value="">Subject</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              width: 90,
              fontSize: "0.95em",
              padding: "4px 7px",
              borderRadius: 4,
              border: "1px solid #cbd5e0",
            }}
          >
            <option value="">Type</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{
              width: 80,
              fontSize: "0.95em",
              padding: "4px 7px",
              borderRadius: 4,
              border: "1px solid #cbd5e0",
            }}
          >
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{
              width: 100,
              fontSize: "0.95em",
              padding: "4px 7px",
              borderRadius: 4,
              border: "1px solid #cbd5e0",
            }}
          >
            <option value="">Country</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            style={{
              width: 120,
              fontSize: "0.95em",
              padding: "4px 7px",
              borderRadius: 4,
              border: "1px solid #cbd5e0",
            }}
          >
            <option value="">School</option>
            {schools.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "0.95em",
              color: "#4a5568",
            }}
          >
            <input
              type="checkbox"
              id="isGlobal"
              checked={isGlobal}
              onChange={(e) => setIsGlobal(e.target.checked)}
              style={{ marginRight: 4 }}
            />
            Global
          </label>
        </div>
      </div>

      <h2
        style={{
          textAlign: "center",
          color: "#1a202c",
          marginBottom: "25px",
          fontSize: "2em",
          fontWeight: "600",
        }}
      >
        Available Past Questions
      </h2>
      {loading && (
        <p style={{ textAlign: "center", color: "#4a5568", fontSize: "1.1em" }}>
          Loading past questions...
        </p>
      )}
      {error && (
        <p style={{ textAlign: "center", color: "#e53e3e", fontSize: "1.1em" }}>
          {error}
        </p>
      )}
      {!loading && exams.length === 0 && !error && (
        <p style={{ textAlign: "center", color: "#4a5568", fontSize: "1.1em" }}>
          No past questions found matching your criteria.
        </p>
      )}

      <div style={{ width: "100%", overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.98em",
          }}
        >
          <thead>
            <tr style={{ background: "#f1f5f9", color: "#2b6cb0" }}>
              <th style={{ textAlign: "left", padding: "7px 6px" }}>
                Exam Name
              </th>
              <th style={{ textAlign: "left", padding: "7px 6px" }}>Year</th>
              <th style={{ textAlign: "left", padding: "7px 6px" }}>Subject</th>
              <th style={{ textAlign: "left", padding: "7px 6px" }}></th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              exams.map((exam) => (
                <tr key={exam.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "7px 6px" }}>
                    <Link
                      href={`/question-vault/${exam.id}`}
                      style={{
                        color: "#2b6cb0",
                        fontWeight: 600,
                        textDecoration: "underline dotted",
                      }}
                    >
                      {exam.name}
                    </Link>
                  </td>
                  <td style={{ padding: "7px 6px" }}>{exam.year}</td>
                  <td style={{ padding: "7px 6px" }}>{exam.course}</td>
                  <td style={{ padding: "7px 6px" }}>
                    <Link
                      href={`/question-vault/${exam.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <button
                        style={{
                          background: "#2b6cb0",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 14px",
                          fontWeight: 600,
                          fontSize: "0.97em",
                          cursor: "pointer",
                          boxShadow: "0 1px 2px rgba(44,62,80,0.07)",
                          transition: "background 0.2s",
                        }}
                      >
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
