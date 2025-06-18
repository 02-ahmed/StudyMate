import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60; // Increase timeout to 60 seconds to match other endpoints

// Initialize the Generative AI client
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export async function POST(req) {
  try {
    // Get the flashcard content
    const { front, back } = await req.json();

    if (!front || !back) {
      return NextResponse.json(
        { error: "Missing required flashcard content" },
        { status: 400 }
      );
    }

    // Initialize the image generation model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-preview-image-generation",
      generationConfig: {
        temperature: 0.4, // Lower temperature for more predictable results
        topK: 32,
        topP: 0.95,
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    // Create a prompt that describes the image to generate
    const imagePrompt = `Generate a clear, educational illustration for a flashcard with the following content:
Front: "${front}"
Back: "${back}"

The image should be visually simple, educational, and help illustrate the concept. It should be suitable for studying and appropriate for all ages.`;

    // Generate the image using the current API structure
    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
    });

    // Extract image data from the response
    let imageData = null;

    console.log("Response structure:", JSON.stringify(response));

    // Access the response parts
    const parts = response.response.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData) {
        imageData = part.inlineData.data;
        break;
      }
    }

    if (!imageData) {
      return NextResponse.json(
        { error: "No image was generated" },
        { status: 500 }
      );
    }

    // Return the image data
    return NextResponse.json({
      imageData: imageData,
      format: "base64",
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
