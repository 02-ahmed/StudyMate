// app/api/ai-answer/route.js

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

export async function POST(req) {
  try {
    const { questionText, sectionName, examName, examYear } = await req.json();
    if (!questionText) {
      return NextResponse.json(
        { error: "Missing question text." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert exam assistant. Given the following context, answer the question as accurately as possible. If you are unsure, say so. Always be concise and clear.

Exam: ${examName || "Unknown"}
Year: ${examYear || "Unknown"}
Section: ${sectionName || "Unknown"}

Question: ${questionText}

IMPORTANT: Your answer will be shown to a student and may be used for study. If you are not sure, say so. Do NOT include any markdown, asterisks, bold, or disclaimers in your answer. The answer should be plain text only. Do NOT include any caution or note about AI answers in your response.`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });
    const aiResponseText = await result.response.text();
    // Remove markdown code block if present and strip asterisks/markdown
    let cleanAiResponseText = aiResponseText
      .replace(/^```[a-z]*\n|\n```$/g, "")
      .trim();
    cleanAiResponseText = cleanAiResponseText.replace(/[*_`#>\-]/g, ""); // Remove common markdown chars

    return NextResponse.json({ answer: cleanAiResponseText }, { status: 200 });
  } catch (error) {
    console.error("AI answer error:", error);
    return NextResponse.json(
      { error: "Failed to generate answer." },
      { status: 500 }
    );
  }
}
