import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `You are a flashcard generator API that MUST ALWAYS respond in valid JSON format.
Your task is to create comprehensive educational flashcards from the provided content.
IMPORTANT: You MUST ONLY respond with JSON in the following format, nothing else:

{
  "flashcards": [
    {
      "front": "question or concept",
      "back": "answer or explanation"
    }
  ]
}

Rules:
1. Generate flashcards proportional to the content:
   - For short content (< 1000 words): at least 15 flashcards
   - For medium content (1000-3000 words): at least 25 flashcards
   - For long content (> 3000 words): at least 40 flashcards
2. Cover ALL important concepts, don't skip any key points
3. Each front and back should be one clear sentence
4. Never include any text outside the JSON structure
5. Never include markdown or formatting
6. Always use double quotes for JSON strings
7. Escape any quotes within the content
8. For lecture slides/educational content:
   - Create cards for definitions, key concepts, and examples
   - Include cards about relationships between concepts
   - Add cards about practical applications
   - Cover both main points and supporting details`;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Add supported MIME types for Gemini
const SUPPORTED_MIME_TYPES = {
  "application/pdf": true,
  "text/plain": true,
  "image/png": true,
  "image/jpeg": true,
  "image/gif": true,
  "image/webp": true,
};

// 10MB in bytes - reasonable limit for PDF processing
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function convertTextToFlashcards(text) {
  // If the text contains bullet points or lists, convert them to flashcards
  const lines = text.split("\n");
  const flashcards = [];

  let currentFront = "";
  let currentBack = "";

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and headers
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("*"))
      continue;

    // If line contains a question mark, treat it as a front
    if (trimmed.includes("?")) {
      // If we have a previous pair, save it
      if (currentFront && currentBack) {
        flashcards.push({ front: currentFront, back: currentBack });
        currentBack = "";
      }
      currentFront = trimmed;
    } else if (currentFront && !currentBack) {
      // If we have a front but no back, this is the back
      currentBack = trimmed;
      flashcards.push({ front: currentFront, back: currentBack });
      currentFront = "";
      currentBack = "";
    }
  }

  // If we don't have enough flashcards, create some from the text
  if (flashcards.length < 5) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    for (let i = 0; i < sentences.length - 1; i += 2) {
      if (sentences[i] && sentences[i + 1]) {
        flashcards.push({
          front: sentences[i].trim(),
          back: sentences[i + 1].trim(),
        });
      }
    }
  }

  return {
    flashcards:
      flashcards.length > 0
        ? flashcards
        : [
            {
              front: "Content Processing Note",
              back: "The content has been processed into study notes. Review the material for key concepts.",
            },
          ],
  };
}

export async function POST(req) {
  let model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  });

  // Check if the request is multipart form data (file upload)
  const contentType = req.headers.get("content-type");
  if (contentType && contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size too large. Maximum size is ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB`,
        },
        { status: 400 }
      );
    }

    // Check if file type is supported
    if (!SUPPORTED_MIME_TYPES[file.type]) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Only PDF, text files, and images (PNG, JPEG, GIF, WebP) are supported.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    // Process file directly with Gemini
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type,
              },
            },
            { text: systemPrompt },
          ],
        },
      ],
    });

    const text = result.response.text();
    console.log("Raw response:", text); // Debug log

    try {
      // First try direct JSON parse
      const flashcards = JSON.parse(text);
      return NextResponse.json(flashcards.flashcards);
    } catch (error) {
      console.log("Initial JSON parse failed, converting text to flashcards"); // Debug log
      // Convert the text response into flashcards
      const processedFlashcards = convertTextToFlashcards(text);
      return NextResponse.json(processedFlashcards.flashcards);
    }
  } else {
    // Handle direct text input
    const data = await req.text();
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: data }, { text: systemPrompt }],
        },
      ],
    });

    const text = result.response.text();
    console.log("Raw response:", text); // Debug log

    try {
      const flashcards = JSON.parse(text);
      return NextResponse.json(flashcards.flashcards);
    } catch (error) {
      const processedFlashcards = convertTextToFlashcards(text);
      return NextResponse.json(processedFlashcards.flashcards);
    }
  }
}
