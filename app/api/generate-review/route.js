import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Log when the file is first loaded
console.log("=== API ROUTE LOADED ===");
console.log("API_KEY value:", process.env.API_KEY);

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export async function POST(request) {
  try {
    console.log("=== POST REQUEST RECEIVED ===");

    // Log the request body
    const body = await request.json();
    console.log("Request body:", body);
    const { topic } = body;

    if (!process.env.API_KEY) {
      console.error("API_KEY is missing or undefined!");
      throw new Error("API key is not configured");
    }

    console.log("Creating Gemini model with API key:", process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log("Generating content for topic:", topic);
    const prompt = `
      I need a comprehensive learning guide about ${topic}.
      Please provide:

      1. Introduction:
      - Basic overview of the field/subject this topic belongs to
      - Why this topic is important
      - Prerequisites for understanding this topic

      2. Main Concept Explanation:
      - Detailed explanation of ${topic}
      - Key principles and components
      - Common applications
      - Visual descriptions (if applicable)

      3. Related Concepts:
      - Connected topics and their relationships
      - How this fits into the broader subject
      - Progressive learning path

      4. Learning Resources:
      - Key terms for finding educational content
      - Suggested topics for further reading
      - Specific concepts to search for in educational videos

      Format the response with clear sections and bullet points.
    `;

    const result = await model.generateContent(prompt);

    console.log("Content generated successfully");
    const response = result.response.text();

    // Parse the response into sections
    console.log("Raw response:", response);
    const sections = response.split(/\d\.\s+/);
    console.log("Parsed sections:", sections);

    // Structure the content
    const structuredContent = {
      introduction: sections[1] || "",
      conceptExplanation: sections[2] || "",
      relatedConcepts: sections[3] || "",
      resources: {
        articles: [
          {
            title: `Introduction to ${topic}`,
            url: `https://scholar.google.com/scholar?q=introduction+${encodeURIComponent(
              topic
            )}`,
          },
          {
            title: `Advanced ${topic} Concepts`,
            url: `https://scholar.google.com/scholar?q=advanced+${encodeURIComponent(
              topic
            )}`,
          },
        ],
        videos: [
          {
            title: `${topic} Basics`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
              topic
            )}+tutorial`,
          },
          {
            title: `${topic} Explained`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
              topic
            )}+explained`,
          },
        ],
      },
    };

    console.log("Sending response:", structuredContent);
    return NextResponse.json(structuredContent);
  } catch (error) {
    console.error("=== ERROR IN API ROUTE ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    return NextResponse.json(
      {
        error: "Failed to generate review content",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
