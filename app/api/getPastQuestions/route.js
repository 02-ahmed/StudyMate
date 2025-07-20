// app/api/getPastQuestions/route.js

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const maxDuration = 60; // Max duration for this API route

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const subject = searchParams.get("subject");
    const type = searchParams.get("type");
    const year = searchParams.get("year");
    const country = searchParams.get("country");
    const isGlobal = searchParams.get("isGlobal"); // This will be a string "true" or "false"
    const school = searchParams.get("school");

    let examsRef = adminDb.collection("exams");

    // Apply filters
    if (subject) {
      examsRef = examsRef.where("course", "==", subject);
    }
    if (type) {
      examsRef = examsRef.where("type", "==", type);
    }
    if (year) {
      examsRef = examsRef.where("year", "==", year);
    }
    if (country) {
      examsRef = examsRef.where("country", "==", country);
    }
    // Firestore does not allow `where` on boolean with string values
    // so convert "true"/"false" to actual boolean
    if (isGlobal !== null) {
      examsRef = examsRef.where("is_global", "==", isGlobal === "true");
    }
    if (school) {
      examsRef = examsRef.where("school", "==", school);
    }

    const snapshot = await examsRef.get();

    const exams = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ exams }, { status: 200 });
  } catch (error) {
    console.error("Error fetching past questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch past questions." },
      { status: 500 }
    );
  }
}
