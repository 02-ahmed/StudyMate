// app/api/getExamDetails/[id]/route.js

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const maxDuration = 60; // Max duration for this API route

export async function GET(req, { params }) {
  try {
    const { id: examId } = params;

    if (!examId) {
      return NextResponse.json(
        { error: "Exam ID is required." },
        { status: 400 }
      );
    }

    // 1. Fetch the main exam document
    const examDoc = await adminDb.collection("exams").doc(examId).get();

    if (!examDoc.exists) {
      return NextResponse.json({ error: "Exam not found." }, { status: 404 });
    }

    const examData = { id: examDoc.id, ...examDoc.data() };

    // 2. Fetch all sections for this exam
    const sectionsSnapshot = await adminDb
      .collection("exam_sections")
      .where("exam_id", "==", examId)
      .orderBy("order", "asc") // Order sections by their order field
      .get();

    const sections = [];
    for (const sectionDoc of sectionsSnapshot.docs) {
      const sectionData = { id: sectionDoc.id, ...sectionDoc.data() };

      // 3. Fetch questions for each section and sort by question number
      const questionsSnapshot = await adminDb
        .collection("questions")
        .where("section_id", "==", sectionData.id)
        .get();

      // Sort questions by their question number to maintain original order
      const questions = questionsSnapshot.docs
        .map((questionDoc) => ({
          id: questionDoc.id,
          ...questionDoc.data(),
        }))
        .sort((a, b) => {
          // Helper function to convert text numbers to integers
          const convertTextToNumber = (text) => {
            if (!text) return 0;

            // If it's already a number, return it
            const num = parseInt(text);
            if (!isNaN(num)) return num;

            // Convert common text numbers to digits
            const textNumbers = {
              one: 1,
              two: 2,
              three: 3,
              four: 4,
              five: 5,
              six: 6,
              seven: 7,
              eight: 8,
              nine: 9,
              ten: 10,
              eleven: 11,
              twelve: 12,
              thirteen: 13,
              fourteen: 14,
              fifteen: 15,
              sixteen: 16,
              seventeen: 17,
              eighteen: 18,
              nineteen: 19,
              twenty: 20,
              "twenty-one": 21,
              "twenty-two": 22,
              "twenty-three": 23,
              "twenty-four": 24,
              "twenty-five": 25,
              "twenty-six": 26,
              "twenty-seven": 27,
              "twenty-eight": 28,
              "twenty-nine": 29,
              thirty: 30,
            };

            const lowerText = text.toLowerCase().trim();
            return textNumbers[lowerText] || 0;
          };

          // Convert question numbers to integers for proper sorting
          const aNum = convertTextToNumber(a.question_number_in_exam);
          const bNum = convertTextToNumber(b.question_number_in_exam);
          return aNum - bNum;
        });

      sectionData.questions = questions;
      sections.push(sectionData);
    }

    examData.sections = sections;

    return NextResponse.json({ exam: examData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching exam details:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam details." },
      { status: 500 }
    );
  }
}
