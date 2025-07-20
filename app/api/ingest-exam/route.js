// app/api/ingest-exam/route.js

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Will need this for Gemini
// import { v4 as uuidv4 } from 'uuid'; // Useful for generating unique IDs (install if needed)

// Set max duration for this potentially long-running API route
export const maxDuration = 300; // 5 minutes (adjust as needed, max is 300s for Vercel Hobby)

export async function POST(req) {
  try {
    // Step 1: Handle the incoming file upload (multipart/form-data)
    const formData = await req.formData();
    const file = formData.get("examScript"); // Assuming frontend sends file with name 'examScript'
    const examName = formData.get("examName"); // e.g., "Ghana Law Entrance Exams 2016/2017"
    const examYear = formData.get("examYear"); // e.g., "2016/2017"
    const examCountry = formData.get("examCountry"); // New: Country of the exam
    const isGlobalExam = formData.get("isGlobalExam") === "true"; // New: Is it a global exam?
    const examSchool = formData.get("examSchool"); // New: School associated with the exam (optional)
    const examSubject = formData.get("examSubject"); // New: Subject/Course of the exam
    const examType = formData.get("examType"); // New: Type of exam (e.g., Midterm, Final)

    if (!file) {
      return NextResponse.json(
        { error: "No exam script file provided." },
        { status: 400 }
      );
    }
    if (!examName || !examYear || !examCountry || !examSubject) {
      // Added examSubject to validation
      return NextResponse.json(
        { error: "Missing exam name, year, country, or subject." },
        { status: 400 }
      );
    }

    // Convert file to buffer for sending to Gemini or storing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const mimeType = file.type; // e.g., "application/pdf" or "image/jpeg"

    // --- Step 2: Call the Gemini API for structured extraction ---
    // (This part will require more detailed prompting and error handling)
    // You'll initialize GoogleGenerativeAI here and call generateContent
    // using the base64Data of the file and a detailed prompt.

    // Example (conceptual) of Gemini call:
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or gemini-2.0-flash

    const prompt = `You are an AI assistant specialized in extracting exam questions from documents.
        Analyze the provided document (PDF or image) which is an exam script.
        The user has provided the following metadata: 
        - Exam Name: ${examName}
        - Exam Year: ${examYear}
        - Exam Country: ${examCountry}
        - Is Global Exam: ${isGlobalExam}
        - Exam School: ${examSchool || "N/A"}
        - Exam Subject: ${examSubject}
        - Exam Type: ${examType || "N/A"}

        Extract the following structured information for each exam paper:
        1. Overall Exam Name (e.g., "Ghana Law Entrance Exam")
        2. Exam Year (e.g., "2016/2017")
        3. Exam Country (e.g., "Ghana" - confirm this based on document context if possible, otherwise use provided)
        4. Is Global Exam (true/false - confirm this based on document context if possible, otherwise use provided)
        5. Exam School (e.g., "University of Ghana" - extract if mentioned, otherwise use provided or null)
        6. Exam Subject (e.g., "Law" - confirm this based on document context if possible, otherwise use provided)
        7. Exam Type (e.g., "Midterm" - extract if mentioned, otherwise use provided or null)
        8. A list of Sections, each with:
           - Section Name (e.g., "Section A: Multiple Choice")
           - Section Number (e.g., "A" or "1")
           - Question Type in Section (e.g., "multiple_choice", "essay")
           - Instructions for the section
           - A list of Questions within this section, each with:
             - Question Number (original number from the paper)
             - Question Text
             - Options (if multiple choice, as an array)
             - Correct Answer (if available, identify based on context or explicit marking)
             - Explanation (if available)

        Format your response as a single JSON object. Ensure the top-level keys match the requested fields, especially for examName, examYear, examCountry, isGlobalExam, examSchool, examSubject, and examType.

        Example JSON structure:
        {
          "examName": "...",
          "examYear": "...",
          "examCountry": "...",
          "isGlobalExam": true,
          "examSchool": "...",
          "examSubject": "...",
          "examType": "...",
          "sections": [
            {
              "sectionName": "...",
              "sectionNumber": "...",
              "questionTypeInSection": "...",
              "instructions": "...",
              "questions": [
                {
                  "questionNumber": 1,
                  "questionText": "...",
                  "options": [...],
                  "correctAnswer": "...",
                  "explanation": "..."
                },
                // ... more questions
              ]
            },
            // ... more sections
          ]
        }
        `;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
          ],
        },
      ],
    });
    const aiResponseText = await result.response.text();
    // Remove markdown code block (```json) if present in Gemini's response
    const cleanAiResponseText = aiResponseText.replace(
      /^```json\n|\n```$/g,
      ""
    );
    const extractedData = JSON.parse(cleanAiResponseText);

    // --- Step 3: Save to Firestore using adminDb ---
    // Create the exam document
    const examRef = await adminDb.collection("exams").add({
      name: extractedData.examName,
      year: extractedData.examYear,
      course: extractedData.examSubject || examSubject, // Use extracted or provided, fixes hardcoded "Law"
      country: extractedData.examCountry || examCountry, // Use extracted or provided
      is_global: extractedData.isGlobalExam || isGlobalExam, // Use extracted or provided
      school: extractedData.examSchool || examSchool || null, // Use extracted, provided, or null
      type: extractedData.examType || examType || null, // New: Exam type
      description: `Extracted questions for ${extractedData.examName} (${extractedData.examYear})`,
      date_added: new Date(),
      total_questions: extractedData.sections.reduce(
        (sum, section) => sum + section.questions.length,
        0
      ),
    });

    const examId = examRef.id;

    // Save sections and questions
    for (const sectionData of extractedData.sections) {
      const sectionRef = await adminDb.collection("exam_sections").add({
        exam_id: examId,
        section_name: sectionData.sectionName,
        section_number: sectionData.sectionNumber,
        question_type_in_section: sectionData.questionTypeInSection,
        instructions: sectionData.instructions,
        num_questions_in_section: sectionData.questions.length,
        order: sectionData.order || 0, // Add an order if AI provides it, default to 0
      });

      const sectionId = sectionRef.id;

      // Batch write for efficiency when adding many questions
      const batch = adminDb.batch();
      for (const questionData of sectionData.questions) {
        const questionRef = adminDb.collection("questions").doc(); // Auto-generate ID
        batch.set(questionRef, {
          exam_id: examId,
          section_id: sectionId,
          question_number_in_exam: questionData.questionNumber,
          question_text: questionData.questionText,
          question_type:
            questionData.questionType || sectionData.questionTypeInSection, // Prefer question-specific type, else section type
          options: questionData.options || [],
          correct_answer: questionData.correctAnswer || null,
          explanation: questionData.explanation || null,
          tags: questionData.tags || [], // If AI can extract tags
        });
      }
      await batch.commit(); // Commit all questions for this section
    }

    return NextResponse.json(
      {
        message: "Exam script processed and saved successfully!",
        examId: examId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing exam script:", error);
    return NextResponse.json(
      { error: "Failed to process exam script." },
      { status: 500 }
    );
  }
}
