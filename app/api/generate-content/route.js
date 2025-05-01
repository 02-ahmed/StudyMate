import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export async function POST(request) {
  try {
    const { topic } = await request.json();

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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse the response into sections
    const sections = response.split(/\d\.\s+/);

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
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
