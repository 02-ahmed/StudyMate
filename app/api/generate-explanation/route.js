import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export async function POST(request) {
  try {
    const { question, answer, tags } = await request.json();

    if (!question || !answer || !tags) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      I need help understanding this concept:
      Question: "${question}"
      Correct Answer: "${answer}"
      Topic: ${tags.join(", ")}

      Please provide:
      1. A detailed explanation of the concept
      2. Key points and relationships to other topics
      3. Common misconceptions and how to avoid them
      4. Study tips and real-world applications
      5. Suggested search terms for finding educational videos and articles about this topic
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the AI response to extract explanation and resource suggestions
    const [mainExplanation, ...resourceSuggestions] = text.split(
      "Suggested search terms:"
    );

    // Generate search queries for educational content
    const searchTerms = resourceSuggestions[0]
      ? resourceSuggestions[0].split(",").map((term) => term.trim())
      : [];

    // Structure resources based on search terms
    const resources = {
      articles: searchTerms.map((term) => ({
        title: `Understanding ${term}`,
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(term)}`,
        source: "Google Scholar",
      })),
      videos: searchTerms.map((term) => ({
        title: `${term} Explained`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          term + " education"
        )}`,
        duration: "Various",
      })),
    };

    return NextResponse.json({
      explanation: mainExplanation.trim(),
      resources,
    });
  } catch (error) {
    console.error("Error generating explanation:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
