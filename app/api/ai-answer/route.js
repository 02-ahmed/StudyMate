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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert exam assistant with deep knowledge of academic subjects, especially law and legal principles. 

IMPORTANT INSTRUCTIONS:
1. ALWAYS attempt to answer the question - never say you're unsure or can't answer
2. Use your knowledge of the subject matter to provide the correct answer
3. For multiple choice questions, provide the letter (A, B, C, D) of the correct option
4. For law questions, use your knowledge of legal principles, statutes, and case law
5. Provide a brief explanation of why your answer is correct
6. Do NOT include any disclaimers, notes, or uncertainty statements
7. The answer should be plain text only

Question: ${questionText}

Context: This is from ${examName} (${examYear})${
      sectionName ? `, Section: ${sectionName}` : ""
    }

Please provide the correct answer:`;

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
