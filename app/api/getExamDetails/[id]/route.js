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
      .orderBy("order", "asc") // Assuming you might add an order field
      .get();

    const sections = [];
    for (const sectionDoc of sectionsSnapshot.docs) {
      const sectionData = { id: sectionDoc.id, ...sectionDoc.data() };

      // 3. Fetch questions for each section
      const questionsSnapshot = await adminDb
        .collection("questions")
        .where("section_id", "==", sectionData.id)
        .orderBy("question_number_in_exam", "asc")
        .get();

      sectionData.questions = questionsSnapshot.docs.map((questionDoc) => ({
        id: questionDoc.id,
        ...questionDoc.data(),
      }));

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
