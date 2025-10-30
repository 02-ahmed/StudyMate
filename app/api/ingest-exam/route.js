// app/api/ingest-exam/route.js

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Will need this for Gemini
// import { v4 as uuidv4 } from 'uuid'; // Useful for generating unique IDs (install if needed)
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

// Set max duration for this potentially long-running API route
export const maxDuration = 60; // Fixed to comply with Vercel hobby plan limits

export async function POST(req) {
  // Clerk authentication and role check
  const { userId } = getAuth(req);
  console.log("Backend - userId:", userId);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user data including metadata
  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata.role;
  console.log("Backend - role:", role);
  const allowedRoles = ["admin", "uploader"];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Step 1: Handle the incoming file upload (multipart/form-data)
    const formData = await req.formData();
    const file = formData.get("examScript"); // Assuming frontend sends file with name 'examScript'
    const extractionMode = formData.get("extractionMode"); // "manual" or "ai"
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

    // Validation based on extraction mode
    if (extractionMode === "manual") {
      if (!examName || !examYear || !examCountry || !examSubject) {
        return NextResponse.json(
          {
            error:
              "Missing exam name, year, country, or subject for manual mode.",
          },
          { status: 400 }
        );
      }
    }

    // Convert file to buffer for sending to Gemini or storing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const mimeType = file.type; // e.g., "application/pdf" or "image/jpeg"

    // --- Step 2: Call the Gemini API for structured extraction ---
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt;
    if (extractionMode === "manual") {
      // Manual mode: Use provided metadata, only extract questions and answers
      prompt = `You are an AI assistant specialized in extracting exam questions from documents.
        Analyze the provided document (PDF or image) which is an exam script.
        
        The user has provided the following metadata (USE THESE EXACTLY, DO NOT EXTRACT FROM DOCUMENT):
        - Exam Name: ${examName}
        - Exam Year: ${examYear}
        - Exam Country: ${examCountry}
        - Is Global Exam: ${isGlobalExam}
        - Exam School: ${examSchool || "N/A"}
        - Exam Subject: ${examSubject}
        - Exam Type: ${examType || "N/A"}

        CRITICAL INSTRUCTIONS:
        1. IGNORE any cover pages, title pages, or Studocu branding - focus only on the actual exam content
        2. Look for the REAL exam title within the actual exam questions/instructions
        3. Preserve the EXACT original question numbers as they appear in the document
        4. Extract questions in the exact order they appear in the document
        5. For answers, be more aggressive - if you have knowledge about the subject, provide the answer
        6. For multiple choice questions, if you know the correct answer, provide it
        7. If the document shows an answer key or marked answers, use those
        8. IMPORTANT: Convert all question numbers to NUMERICAL format (e.g., "Question Six" should be questionNumber: 6, "Question Twenty" should be questionNumber: 20)
        9. Maintain the EXACT order questions appear in the document - do not reorder them

        Extract ONLY the following structured information:
        1. A list of Sections, each with:
           - Section Name (e.g., "Section A: Multiple Choice")
           - Section Number (e.g., "A" or "1")
           - Question Type in Section (e.g., "multiple_choice", "essay")
           - Instructions for the section
           - A list of Questions within this section, each with:
             - Question Number (MUST be numerical - convert text numbers to digits: "Six" = 6, "Twenty" = 20, etc.)
             - Question Text
             - Options (if multiple choice, as an array)
             - Correct Answer (if you have knowledge about the subject, provide it)
             - Explanation (if available)

        For answers, follow these rules:
        - If the document explicitly shows the correct answer (marked, circled, in answer key), use it
        - If you have knowledge about the subject matter, provide the correct answer
        - For law questions, use your knowledge of legal principles
        - For multiple choice, provide the letter (A, B, C, D) of the correct option
        - If you are unsure, still provide your best educated guess based on the subject matter

        Format your response as a single JSON object with this structure:
        {
          "examName": "${examName}",
          "examYear": "${examYear}",
          "examCountry": "${examCountry}",
          "isGlobalExam": ${isGlobalExam},
          "examSchool": "${examSchool || ""}",
          "examSubject": "${examSubject}",
          "examType": "${examType || ""}",
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
                }
              ]
            }
          ]
        }`;
    } else {
      // AI extraction mode: Extract everything from document
      prompt = `You are an AI assistant specialized in extracting exam questions from documents.
        Analyze the provided document (PDF or image) which is an exam script.
        
        CRITICAL INSTRUCTIONS:
        1. IGNORE any cover pages, title pages, or Studocu branding - focus only on the actual exam content
        2. Look for the REAL exam title within the actual exam questions/instructions, not on cover pages
        3. Preserve the EXACT original question numbers as they appear in the document
        4. Extract questions in the exact order they appear in the document
        5. For answers, be more aggressive - if you have knowledge about the subject, provide the answer
        6. For multiple choice questions, if you know the correct answer, provide it
        7. If the document shows an answer key or marked answers, use those
        8. IMPORTANT: Convert all question numbers to NUMERICAL format (e.g., "Question Six" should be questionNumber: 6, "Question Twenty" should be questionNumber: 20)
        9. Maintain the EXACT order questions appear in the document - do not reorder them
        
        Extract ALL the following structured information from the document:
        1. Overall Exam Name (extract from actual exam content, NOT cover pages)
        2. Exam Year (extract from document)
        3. Exam Country (extract from document context)
        4. Is Global Exam (true/false - determine from document context)
        5. Exam School (extract if mentioned in document)
        6. Exam Subject (extract from document context)
        7. Exam Type (extract if mentioned in document)
        8. A list of Sections, each with:
           - Section Name (e.g., "Section A: Multiple Choice")
           - Section Number (e.g., "A" or "1")
           - Question Type in Section (e.g., "multiple_choice", "essay")
           - Instructions for the section
           - A list of Questions within this section, each with:
             - Question Number (MUST be numerical - convert text numbers to digits: "Six" = 6, "Twenty" = 20, etc.)
             - Question Text
             - Options (if multiple choice, as an array)
             - Correct Answer (if you have knowledge about the subject, provide it)
             - Explanation (if available)

        For answers, follow these rules:
        - If the document explicitly shows the correct answer (marked, circled, in answer key), use it
        - If you have knowledge about the subject matter, provide the correct answer
        - For law questions, use your knowledge of legal principles
        - For multiple choice, provide the letter (A, B, C, D) of the correct option
        - If you are unsure, still provide your best educated guess based on the subject matter

        Format your response as a single JSON object with this structure:
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
                }
              ]
            }
          ]
        }`;
    }

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
