import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const maxDuration = 300; // Adjust as needed

export async function GET() {
  try {
    const examsRef = adminDb.collection("exams");
    const examsSnapshot = await examsRef.get();

    const allExamsData = [];

    for (const examDoc of examsSnapshot.docs) {
      const examData = { id: examDoc.id, ...examDoc.data() };

      // Fetch sections for this exam
      const sectionsRef = adminDb
        .collection("exam_sections")
        .where("exam_id", "==", examDoc.id)
        .orderBy("order");
      const sectionsSnapshot = await sectionsRef.get();
      const sections = [];

      for (const sectionDoc of sectionsSnapshot.docs) {
        const sectionData = { id: sectionDoc.id, ...sectionDoc.data() };

        // Fetch questions for this section
        const questionsRef = adminDb
          .collection("questions")
          .where("section_id", "==", sectionDoc.id)
          .orderBy("question_number_in_exam");
        const questionsSnapshot = await questionsRef.get();
        const questions = questionsSnapshot.docs.map((qDoc) => ({
          id: qDoc.id,
          ...qDoc.data(),
        }));

        sections.push({ ...sectionData, questions });
      }
      allExamsData.push({ ...examData, sections });
    }

    return NextResponse.json({ exams: allExamsData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam data." },
      { status: 500 }
    );
  }
}
