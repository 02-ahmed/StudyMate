// app/api/debugQuestions/route.js

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth } from "@clerk/nextjs/server";

export const maxDuration = 60;

export async function GET(req) {
  try {
    // Clerk authentication
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all exams
    const examsSnapshot = await adminDb.collection("exams").get();
    const exams = examsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get all sections
    const sectionsSnapshot = await adminDb.collection("exam_sections").get();
    const sections = sectionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get all questions
    const questionsSnapshot = await adminDb.collection("questions").get();
    const questions = questionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        exams: exams.length,
        sections: sections.length,
        questions: questions.length,
        examDetails: exams,
        sectionDetails: sections,
        questionDetails: questions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Failed to debug questions." },
      { status: 500 }
    );
  }
}
