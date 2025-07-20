// app/api/deleteQuestions/route.js

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

    const { questionIds, examId } = await req.json();

    if (
      !questionIds ||
      !Array.isArray(questionIds) ||
      questionIds.length === 0
    ) {
      return NextResponse.json(
        { error: "No question IDs provided." },
        { status: 400 }
      );
    }

    if (!examId) {
      return NextResponse.json(
        { error: "Exam ID is required." },
        { status: 400 }
      );
    }

    // Verify the exam exists and belongs to the user (optional security check)
    const examDoc = await adminDb.collection("exams").doc(examId).get();
    if (!examDoc.exists) {
      return NextResponse.json({ error: "Exam not found." }, { status: 404 });
    }

    // Delete questions in batches
    const batch = adminDb.batch();
    let deletedCount = 0;

    for (const questionId of questionIds) {
      try {
        const questionRef = adminDb.collection("questions").doc(questionId);
        const questionDoc = await questionRef.get();

        if (questionDoc.exists) {
          // Verify the question belongs to the specified exam
          const questionData = questionDoc.data();
          if (questionData.exam_id === examId) {
            batch.delete(questionRef);
            deletedCount++;
          } else {
            console.warn(
              `Question ${questionId} does not belong to exam ${examId}`
            );
          }
        } else {
          console.warn(`Question ${questionId} not found`);
        }
      } catch (error) {
        console.error(`Error processing question ${questionId}:`, error);
      }
    }

    // Commit the batch deletion
    if (deletedCount > 0) {
      await batch.commit();
    }

    // Update the exam's total question count
    if (deletedCount > 0) {
      const examRef = adminDb.collection("exams").doc(examId);
      const examDoc = await examRef.get();

      if (examDoc.exists) {
        const currentTotal = examDoc.data().total_questions || 0;
        const newTotal = Math.max(0, currentTotal - deletedCount);

        await examRef.update({
          total_questions: newTotal,
        });
      }
    }

    return NextResponse.json(
      {
        message: `Successfully deleted ${deletedCount} question(s).`,
        deletedCount: deletedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting questions:", error);
    return NextResponse.json(
      { error: "Failed to delete questions." },
      { status: 500 }
    );
  }
}
