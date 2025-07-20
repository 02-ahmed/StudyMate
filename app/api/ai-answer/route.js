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

    const prompt = `You are an expert exam assistant. Always attempt to answer the following question, even if you are not sure. Do not say 'I am unsure' or similar phrases. If you must guess, do so, but do not mention that you are guessing. Do NOT include any disclaimers or notes in your answer. The answer should be plain text only.\n\nQuestion (with options):\n${questionText}`;

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
