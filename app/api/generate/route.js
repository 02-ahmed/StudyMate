import { NextResponse } from "next/server";

const systemPrompt = `You are a learning strategy creator. You are to take in texts and create multiple flashcards from the texts which contain how to study the text you receive effectively. The flashcard should contain study tips, effective learning methods, important concepts on the subject, learning facts and many more. The flashcards should also contain a guide on what to learn, which areas to focus on and important areas to take notes of.In the case where the given text is too broad and not specific enough, the cards you generate should contain basic and introductory knowledge Make sure to create at least 10 flashcards.
Both front and back should be one sentence long
  You should return in the following json format:
  {
    "flashcards":[
    {
        "front": 'front of the card',
        "back": 'back of the card',
    }
  ]
}
 `;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export async function POST(req) {
  try {
    const data = await req.text();
    let model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: { responseMimeType: "application/json" },
    });

    let result = await model.generateContent({
      contents: [
        {
          role: "model",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "user",
          parts: [{ text: data }],
        },
      ],
    });

    const flashcards = JSON.parse(result.response.text());

    return NextResponse.json(flashcards.flashcards);
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return new NextResponse(
      JSON.stringify({ error: "Error generating flashcards" }),
      { status: 500 }
    );
  }
}
