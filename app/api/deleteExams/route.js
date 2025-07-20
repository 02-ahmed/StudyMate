// app/api/deleteExams/route.js

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

export const maxDuration = 60;

export async function POST(req) {
  try {
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

    const { examIds } = await req.json();

    if (!examIds || !Array.isArray(examIds) || examIds.length === 0) {
      return NextResponse.json(
        { error: "No exam IDs provided." },
        { status: 400 }
      );
    }

    let deletedCount = 0;

    for (const examId of examIds) {
      try {
        // 1. Get all sections for this exam
        const sectionsSnapshot = await adminDb
          .collection("exam_sections")
          .where("exam_id", "==", examId)
          .get();

        // 2. Delete all questions for each section
        for (const sectionDoc of sectionsSnapshot.docs) {
          const questionsSnapshot = await adminDb
            .collection("questions")
            .where("section_id", "==", sectionDoc.id)
            .get();

          // Delete all questions in this section
          const questionBatch = adminDb.batch();
          questionsSnapshot.docs.forEach((questionDoc) => {
            questionBatch.delete(questionDoc.ref);
          });
          await questionBatch.commit();

          // Delete the section
          await sectionDoc.ref.delete();
        }

        // 3. Delete the exam itself
        await adminDb.collection("exams").doc(examId).delete();

        deletedCount++;
        console.log(`Successfully deleted exam ${examId} and all its data`);
      } catch (error) {
        console.error(`Error deleting exam ${examId}:`, error);
      }
    }

    return NextResponse.json(
      {
        message: `Successfully deleted ${deletedCount} exam(s) and all associated data.`,
        deletedCount: deletedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting exams:", error);
    return NextResponse.json(
      { error: "Failed to delete exams." },
      { status: 500 }
    );
  }
}
