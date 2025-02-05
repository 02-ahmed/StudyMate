import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Log when the file is first loaded
console.log("=== API ROUTE LOADED ===");
console.log("API_KEY value:", process.env.API_KEY ? "[PRESENT]" : "[MISSING]");

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
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }

    console.log(
      "Creating Gemini model with API key:",
      process.env.API_KEY ? "[PRESENT]" : "[MISSING]"
    );
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

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response text
    const cleanedText = text.replace(/```\w*\n?|\n?```/g, "").trim();

    // Parse the response into sections
    const sections = cleanedText.split(/\d\.\s+/);

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

    return NextResponse.json(structuredContent);
  } catch (error) {
    console.error("Error generating review content:", error);
    return NextResponse.json(
      { error: "Failed to generate review content" },
      { status: 500 }
    );
  }
}
