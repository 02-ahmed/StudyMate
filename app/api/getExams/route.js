import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth } from "@clerk/nextjs/server";

export const maxDuration = 60; // Fixed to comply with Vercel hobby plan limits

export async function GET(req) {
  try {
    // Clerk authentication and role check
    const { userId } = getAuth(req);
    console.log("Backend - userId:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const examsRef = adminDb.collection("exams");
    const examsSnapshot = await examsRef.get();

    const allExamsData = [];

    for (const examDoc of examsSnapshot.docs) {
      const examData = { id: examDoc.id, ...examDoc.data() };

      // Fetch sections for this exam
      const sectionsRef = adminDb
        .collection("exam_sections")
        .where("exam_id", "==", examDoc.id);
      const sectionsSnapshot = await sectionsRef.get();
      const sections = [];

      for (const sectionDoc of sectionsSnapshot.docs) {
        const sectionData = { id: sectionDoc.id, ...sectionDoc.data() };

        // Fetch questions for this section
        const questionsRef = adminDb
          .collection("questions")
          .where("section_id", "==", sectionDoc.id);
        const questionsSnapshot = await questionsRef.get();
        const questions = questionsSnapshot.docs.map((qDoc) => ({
          id: qDoc.id,
          ...qDoc.data(),
        }));

        sections.push({ ...sectionData, questions });
      }
      allExamsData.push({ ...examData, sections });
    }

    console.log("Returning exams:", allExamsData.length);
    return NextResponse.json({ exams: allExamsData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam data." },
      { status: 500 }
    );
  }
}
