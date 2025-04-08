import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Log when the file is first loaded
console.log("=== API ROUTE LOADED ===");
console.log("API_KEY value:", process.env.API_KEY ? "[PRESENT]" : "[MISSING]");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export async function POST(request) {
  try {
    const { topic } = await request.json();

    if (!process.env.API_KEY) {
      console.error("API_KEY is missing or undefined!");
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 16384,
      },
    });

    const prompt = `Generate a comprehensive study guide about ${topic}.

You are a study guide generator that MUST return a valid JSON object with exactly this structure:
{
  "detailedNotes": "Start with a clear introduction to ${topic}, followed by key concepts, definitions, and important points. Do not use headers or bullet points - write in clear, flowing paragraphs.",
  
  "explanations": "Provide detailed explanations of complex concepts, real-world examples, and practical applications. Write in clear paragraphs without headers or bullet points.",
  
  "studyResources": [
    {
      "title": "Specific, descriptive title of the resource",
      "url": "Direct, working URL to the resource",
      "description": "2-3 sentence description of what this resource covers"
    }
  ],
  
  "videoContent": [
    {
      "title": "Specific video or channel name",
      "url": "Direct URL to video or relevant playlist",
      "description": "Brief description of video content"
    }
  ],
  
  "practiceContent": "List specific practice exercises, sample problems, or review questions. Write in clear paragraphs without headers or bullet points."
}

Critical Requirements:
1. Response MUST be valid JSON - no markdown, no extra text
2. Write content in clear, flowing paragraphs
3. NO headers, bullet points, or section markers in the text
4. NO phrases like "In this section..." or "Study Resources:"
5. Include 3-5 highly relevant resources in studyResources and videoContent
6. All URLs must be real, working URLs (use Google Scholar, YouTube, Coursera, etc.)
7. Content should be comprehensive but concise
8. Focus on accuracy and clarity`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response text of any markdown code blocks
    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();

    // Parse the JSON response
    let content;
    try {
      content = JSON.parse(cleanedText);
    } catch (error) {
      console.error("Failed to parse AI response as JSON:", error);
      console.log("Raw response:", text);
      console.log("Cleaned response:", cleanedText);

      // Attempt to fix common JSON issues
      try {
        // Try to fix any remaining formatting issues
        const furtherCleanedText = cleanedText
          .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes
          .replace(/[\u2018\u2019]/g, "'") // Replace smart single quotes
          .replace(/\n/g, " ") // Remove newlines
          .trim();
        content = JSON.parse(furtherCleanedText);
      } catch (secondError) {
        console.error("Failed second attempt to parse JSON:", secondError);
        return NextResponse.json(
          { error: "Invalid response format from AI" },
          { status: 500 }
        );
      }
    }

    // Add default resources if none were generated
    if (!content.studyResources || content.studyResources.length === 0) {
      content.studyResources = [
        {
          title: "Google Scholar Research",
          url: `https://scholar.google.com/scholar?q=${encodeURIComponent(
            topic
          )}`,
          description: `Latest academic research on ${topic}`,
        },
        {
          title: "Coursera Courses",
          url: `https://www.coursera.org/search?query=${encodeURIComponent(
            topic
          )}`,
          description: `Online courses related to ${topic}`,
        },
      ];
    }

    if (!content.videoContent || content.videoContent.length === 0) {
      content.videoContent = [
        {
          title: "Educational Lectures",
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
            topic
          )}+lecture`,
          description: `University-level lectures on ${topic}`,
        },
        {
          title: "Tutorial Videos",
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
            topic
          )}+tutorial`,
          description: `Step-by-step tutorials on ${topic}`,
        },
      ];
    }

    return NextResponse.json({ sections: content });
  } catch (error) {
    console.error("Error generating review content:", error);
    return NextResponse.json(
      { error: "Failed to generate review content" },
      { status: 500 }
    );
  }
}
