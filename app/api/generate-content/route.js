import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Language-specific prompts
const LANGUAGE_PROMPTS = {
  en: {
    language: "English",
    introduction: "Introduction",
    mainConcept: "Main Concept Explanation",
    relatedConcepts: "Related Concepts",
    learningResources: "Learning Resources",
  },
  es: {
    language: "Spanish",
    introduction: "Introducción",
    mainConcept: "Explicación del Concepto Principal",
    relatedConcepts: "Conceptos Relacionados",
    learningResources: "Recursos de Aprendizaje",
  },
  fr: {
    language: "French",
    introduction: "Introduction",
    mainConcept: "Explication du Concept Principal",
    relatedConcepts: "Concepts Connexes",
    learningResources: "Ressources d'Apprentissage",
  },
  de: {
    language: "German",
    introduction: "Einführung",
    mainConcept: "Erklärung des Hauptkonzepts",
    relatedConcepts: "Verwandte Konzepte",
    learningResources: "Lernressourcen",
  },
};

export async function POST(request) {
  try {
    const { topic, language = "en" } = await request.json();
    const sections = LANGUAGE_PROMPTS[language];

    const prompt = `
      Generate a comprehensive learning guide about ${topic} in ${sections.language}.
      Please provide:

      1. ${sections.introduction}:
      - Basic overview of the field/subject this topic belongs to
      - Why this topic is important
      - Prerequisites for understanding this topic

      2. ${sections.mainConcept}:
      - Detailed explanation of ${topic}
      - Key principles and components
      - Common applications
      - Visual descriptions (if applicable)

      3. ${sections.relatedConcepts}:
      - Connected topics and their relationships
      - How this fits into the broader subject
      - Progressive learning path

      4. ${sections.learningResources}:
      - Key terms for finding educational content
      - Suggested topics for further reading
      - Specific concepts to search for in educational videos

      Please provide the response in ${sections.language}.
      Format the response with clear sections and bullet points.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse the response into sections
    const contentSections = response.split(/\d\.\s+/);

    // Structure the content
    const structuredContent = {
      introduction: contentSections[1] || "",
      conceptExplanation: contentSections[2] || "",
      relatedConcepts: contentSections[3] || "",
      resources: {
        articles: [
          {
            title: `${sections.introduction} - ${topic}`,
            url: `https://scholar.google.com/scholar?q=introduction+${encodeURIComponent(
              topic
            )}&hl=${language}`,
          },
          {
            title: `${sections.mainConcept} - ${topic}`,
            url: `https://scholar.google.com/scholar?q=advanced+${encodeURIComponent(
              topic
            )}&hl=${language}`,
          },
        ],
        videos: [
          {
            title: `${topic} - ${sections.introduction}`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
              topic
            )}+tutorial&hl=${language}`,
          },
          {
            title: `${topic} - ${sections.mainConcept}`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
              topic
            )}+explained&hl=${language}`,
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
