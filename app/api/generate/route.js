import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `You are a flashcard generator API that MUST ALWAYS respond in valid JSON format.
Your task is to create comprehensive educational flashcards about the specific topic or text provided by the user.
If a target language is specified, generate the flashcards in that language while maintaining academic accuracy and natural language use.

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
1. Generate flashcards SPECIFICALLY about the user's input text/topic
2. Generate flashcards proportional to the content:
   - For short content (< 1000 words): at least 15 flashcards
   - For medium content (1000-3000 words): at least 25 flashcards
   - For long content (> 3000 words): at least 40 flashcards
3. Cover ALL important aspects of the topic provided
4. Each front and back should be one clear sentence
5. Never include any text outside the JSON structure
6. Always use double quotes for JSON strings
7. Escape any quotes within the content
8. For any topic:
   - Include factual information and key details
   - Cover important dates, events, or characteristics
   - Include significant achievements or notable works
   - Add relevant context and background information
   - Focus on what makes the topic unique or significant
9. When generating in a specific language:
   - Use proper grammar and natural expressions
   - Maintain academic accuracy
   - Consider cultural context when relevant
   - Use appropriate academic/formal language level`;

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

// 1MB in bytes - limit for free plan
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

// Add supported languages
const SUPPORTED_LANGUAGES = {
  en: "English",
  es: "Spanish",
  fr: "French",
};

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
        flashcards.push({
          front: currentFront.replace(/^front:\s*/i, "").trim(),
          back: currentBack.replace(/^back:\s*/i, "").trim(),
        });
        currentBack = "";
      }
      currentFront = trimmed;
    } else if (currentFront && !currentBack) {
      // If we have a front but no back, this is the back
      currentBack = trimmed;
      flashcards.push({
        front: currentFront.replace(/^front:\s*/i, "").trim(),
        back: currentBack.replace(/^back:\s*/i, "").trim(),
      });
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
          front: sentences[i].replace(/^front:\s*/i, "").trim(),
          back: sentences[i + 1].replace(/^back:\s*/i, "").trim(),
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
      topP: 0.8,
      maxOutputTokens: 8192,
    },
  });

  // Check if it's a FormData request (file upload)
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size too large. Free plan maximum size is ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB. Please upgrade for larger file uploads.`,
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
            { text: systemPrompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type,
              },
            },
          ],
        },
      ],
    });

    const text = await result.response.text();
    // Debug log

    try {
      // First try direct JSON parse
      const flashcards = JSON.parse(text);

      // Clean up any potential "front:" or "back:" text in the content
      const cleanedFlashcards = flashcards.flashcards.map((card) => ({
        front: card.front.replace(/^front:\s*/i, "").trim(),
        back: card.back.replace(/^back:\s*/i, "").trim(),
      }));

      return NextResponse.json(cleanedFlashcards);
    } catch (error) {
      // Debug log

      // Try to fix truncated JSON by finding the last complete flashcard
      const lastCompleteCard = text.lastIndexOf('}, {"front"');
      if (lastCompleteCard !== -1) {
        const fixedText = text.substring(0, lastCompleteCard + 1) + "]}";
        try {
          const fixedJson = JSON.parse(fixedText);

          // Clean up any potential "front:" or "back:" text in the content
          const cleanedFlashcards = fixedJson.flashcards.map((card) => ({
            front: card.front.replace(/^front:\s*/i, "").trim(),
            back: card.back.replace(/^back:\s*/i, "").trim(),
          }));

          return NextResponse.json(cleanedFlashcards);
        } catch (error) {}
      }

      // If all else fails, convert text to flashcards
      const processedFlashcards = convertTextToFlashcards(text);
      return NextResponse.json(processedFlashcards.flashcards);
    }
  } else {
    // Handle direct text input
    const data = await req.text();
    let targetLanguage = "en"; // Default to English

    // Try to parse the request as JSON to check for language parameter
    try {
      const jsonData = JSON.parse(data);
      if (jsonData.language && SUPPORTED_LANGUAGES[jsonData.language]) {
        targetLanguage = jsonData.language;
      }
      // Use the content field if it exists, otherwise use the raw data
      const content = jsonData.content || data;

      // Add language instruction to the prompt
      const languagePrompt =
        targetLanguage !== "en"
          ? `Generate the flashcards in ${SUPPORTED_LANGUAGES[targetLanguage]}. Ensure natural language use and proper grammar.`
          : "";

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt },
              { text: languagePrompt },
              { text: content },
            ],
          },
        ],
      });

      const text = await result.response.text();
      // Debug log

      try {
        const flashcards = JSON.parse(text);

        // Clean up any potential "front:" or "back:" text in the content
        const cleanedFlashcards = flashcards.flashcards.map((card) => ({
          front: card.front.replace(/^front:\s*/i, "").trim(),
          back: card.back.replace(/^back:\s*/i, "").trim(),
        }));

        return NextResponse.json(cleanedFlashcards);
      } catch (error) {
        const processedFlashcards = convertTextToFlashcards(text);
        return NextResponse.json(processedFlashcards.flashcards);
      }
    } catch (error) {
      // If JSON parsing fails, treat it as plain text input in English
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt }, { text: data }],
          },
        ],
      });

      const text = await result.response.text();

      try {
        const flashcards = JSON.parse(text);
        return NextResponse.json(flashcards.flashcards);
      } catch (error) {
        const processedFlashcards = convertTextToFlashcards(text);
        return NextResponse.json(processedFlashcards.flashcards);
      }
    }
  }
}
