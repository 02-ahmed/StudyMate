import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/utils/firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";

// Log when the file is first loaded
console.log("=== API ROUTE LOADED ===");
console.log("API_KEY value:", process.env.API_KEY ? "[PRESENT]" : "[MISSING]");

// Map of language codes to full language names
const LANGUAGES = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
};

console.log("Available languages:", Object.keys(LANGUAGES));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export async function POST(request) {
  console.log("=== GENERATE REVIEW CONTENT API ENDPOINT CALLED ===");
  console.log("Request method:", request.method);
  console.log(
    "Request headers:",
    Object.fromEntries(request.headers.entries())
  );

  try {
    const requestBody = await request.json();
    console.log("Request body received:", requestBody);
    console.log("Request body type:", typeof requestBody);
    console.log("Request body keys:", Object.keys(requestBody));
    console.log("Raw request body (stringified):", JSON.stringify(requestBody));

    // Extract userId from headers if available
    const userId = request.headers.get("x-user-id") || null;
    console.log("User ID from headers:", userId || "not provided");
    console.log("User ID type:", typeof userId);
    console.log("User ID length:", userId ? userId.length : 0);
    console.log("User ID starts with 'user_':", userId?.startsWith("user_"));

    // Log flashcard sets on the server side if we have a user ID
    if (userId) {
      try {
        console.log("🔍 === SERVER-SIDE FLASHCARD SETS CHECK === 🔍");
        console.log(`Checking flashcard sets for user: ${userId}`);
        console.log(
          `User ID format valid: ${
            typeof userId === "string" && userId.length > 0
          }`
        );

        if (!userId || typeof userId !== "string" || userId.length === 0) {
          console.log("⚠️ Invalid user ID format, cannot query Firestore");
          console.log(`User ID: "${userId}"`);
          console.log(`User ID type: ${typeof userId}`);
        } else {
          console.log("✅ User ID format is valid for Firestore query");

          try {
            console.log(
              `Creating collection reference to users/${userId}/flashcardSets`
            );
            const flashcardSetsRef = collection(
              db,
              "users",
              userId,
              "flashcardSets"
            );
            console.log("Collection reference created successfully");

            try {
              console.log("Executing Firestore query...");
              const snapshot = await getDocs(flashcardSetsRef);
              console.log(
                `Query executed. Found ${snapshot.size} flashcard sets on server`
              );

              if (snapshot.empty) {
                console.log(
                  "⚠️ WARNING: No flashcard sets found on server for this user"
                );
                console.log("This could indicate:");
                console.log("1. The user has not created any flashcard sets");
                console.log("2. The user ID might be incorrect");
                console.log(
                  "3. There might be a permissions issue with Firestore"
                );
              } else {
                console.log(
                  `✅ Successfully found ${snapshot.size} flashcard sets`
                );
                console.log("--- FLASHCARD SETS DETAILS ---");

                let index = 0;
                snapshot.forEach((docSnap) => {
                  index++;
                  const data = docSnap.data();
                  console.log(
                    `========== FLASHCARD SET ${index}: ${docSnap.id} ==========`
                  );
                  console.log(`📝 Name: ${data.name || "Unnamed"}`);
                  console.log(`🌐 Language: ${data.language || "not set"}`);
                  console.log(`🔍 Language type: ${typeof data.language}`);
                  console.log(`🔍 Raw language value: "${data.language}"`);
                  console.log(
                    `🔍 Stringified language: ${JSON.stringify(data.language)}`
                  );
                  console.log(
                    `🔍 Is language field present: ${"language" in data}`
                  );
                  console.log(
                    `🔍 Created at: ${
                      data.createdAt
                        ? typeof data.createdAt.toDate === "function"
                          ? data.createdAt.toDate()
                          : data.createdAt
                        : "unknown"
                    }`
                  );
                  console.log(
                    `📚 Flashcards count: ${
                      data.flashcards ? data.flashcards.length : 0
                    }`
                  );
                  console.log(`🔍 Full data: ${JSON.stringify(data)}`);
                  console.log("============================================");
                });
              }
            } catch (snapshotError) {
              console.error(
                "❌ Error getting documents from collection:",
                snapshotError
              );
              console.error("Error message:", snapshotError.message);
              console.error("Error stack:", snapshotError.stack);
              console.error("Error code:", snapshotError.code);
              console.error("Error name:", snapshotError.name);
            }
          } catch (collectionError) {
            console.error(
              "❌ Error creating collection reference:",
              collectionError
            );
            console.error("Error message:", collectionError.message);
            console.error("Error stack:", collectionError.stack);
          }
        }
      } catch (error) {
        console.error(
          "❌ Error setting up flashcard sets check on server:",
          error
        );
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
        console.error("Error type:", error.constructor.name);
      }
    } else {
      console.log(
        "⚠️ No user ID available for server-side flashcard set check"
      );
      console.log("This could be because:");
      console.log("1. The user is not authenticated");
      console.log("2. The StoreUserInfo component didn't store the user ID");
      console.log("3. The x-user-id header was not sent from the client");
    }

    // Extract topic and language from request body
    // Default to "en" ONLY if language is completely missing from the request
    const { topic, language = "en" } = requestBody;
    console.log("========== API REQUEST PROCESSING ==========");
    console.log("Extracted topic:", topic);
    console.log("Extracted language:", language);
    console.log("Extracted language (quoted):", `"${language}"`);
    console.log("Extracted language type:", typeof language);
    console.log("Is language null?", language === null);
    console.log("Is language undefined?", language === undefined);
    console.log("Is language empty string?", language === "");
    console.log("Language string length:", language ? language.length : 0);
    console.log("Is language in request body?", "language" in requestBody);
    console.log(
      "Request body language value:",
      JSON.stringify(requestBody.language)
    );
    console.log("Raw request body:", JSON.stringify(requestBody));

    // Log the raw language value from the request body
    console.log("Raw language from request body:", requestBody.language);
    console.log("Raw language type:", typeof requestBody.language);
    console.log("Raw language quoted:", `"${requestBody.language}"`);
    console.log("===========================================");

    // Ensure we have a valid language code
    // If language is not in our supported languages map, default to English
    const validLanguage = LANGUAGES[language] ? language : "en";
    console.log("========== LANGUAGE VALIDATION ==========");
    console.log("Validated language:", validLanguage);
    console.log("Validated language (quoted):", `"${validLanguage}"`);
    console.log("Is language valid?", LANGUAGES[language] ? "yes" : "no");
    console.log("Supported languages:", Object.keys(LANGUAGES));
    console.log("Is language in supported languages?", language in LANGUAGES);
    console.log(
      "Why defaulting to English:",
      !LANGUAGES[language]
        ? "Language not supported"
        : "Using provided language"
    );

    console.log("========================================");

    const languageName = LANGUAGES[validLanguage] || "English";
    console.log("Language name:", languageName);

    console.log("=== GENERATE REVIEW CONTENT API CALLED ===");
    console.log(`Topic: "${topic}"`);
    console.log(`Requested language code: "${language}"`);
    console.log(`Validated language code: "${validLanguage}"`);
    console.log(`Language name: "${languageName}"`);
    console.log(
      `Generating review content for topic: "${topic}" in language: ${validLanguage} (${languageName})`
    );

    if (!process.env.API_KEY) {
      console.error("API_KEY is missing or undefined!");
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }

    console.log("Creating generative model instance");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 16384,
      },
    });

    // Enhanced prompt with stronger emphasis on the target language
    const prompt = `Generate a comprehensive study guide about "${topic}" ENTIRELY IN ${languageName.toUpperCase()}.

You are a study guide generator that MUST return a valid JSON object with exactly this structure:
{
  "detailedNotes": "Start with a clear introduction to ${topic}, followed by key concepts, definitions, and important points. Do not use headers or bullet points - write in clear, flowing paragraphs. WRITE THIS ENTIRELY IN ${languageName.toUpperCase()}.",
  
  "explanations": "Provide detailed explanations of complex concepts, real-world examples, and practical applications. Write in clear paragraphs without headers or bullet points. WRITE THIS ENTIRELY IN ${languageName.toUpperCase()}.",
  
  "studyResources": [
    {
      "title": "Specific, descriptive title of the resource in ${languageName.toUpperCase()}",
      "url": "Direct, working URL to the resource",
      "description": "2-3 sentence description of what this resource covers in ${languageName.toUpperCase()}"
    }
  ],
  
  "videoContent": [
    {
      "title": "Specific video or channel name in ${languageName.toUpperCase()}",
      "url": "Direct URL to video or relevant playlist",
      "description": "Brief description of video content in ${languageName.toUpperCase()}"
    }
  ],
  
  "practiceContent": "List specific practice exercises, sample problems, or review questions. Write in clear paragraphs without headers or bullet points. WRITE THIS ENTIRELY IN ${languageName.toUpperCase()}."
}

CRITICAL REQUIREMENTS:
1. Response MUST be valid JSON - no markdown, no extra text
2. ALL TEXT CONTENT MUST BE WRITTEN ENTIRELY IN ${languageName.toUpperCase()} - this is the most important requirement
3. NO headers, bullet points, or section markers in the text
4. NO phrases like "In this section..." or "Study Resources:"
5. Include 3-5 highly relevant resources in studyResources and videoContent
6. All URLs must be real, working URLs (use Google Scholar, YouTube, Coursera, etc.)
7. Content should be comprehensive but concise
8. Focus on accuracy and clarity
9. NEVER mix languages - use ONLY ${languageName.toUpperCase()} for ALL text content`;

    console.log("Prompt length:", prompt.length);
    console.log("Prompt first 100 chars:", prompt.substring(0, 100));
    console.log("Prompt language emphasis:", languageName.toUpperCase());

    console.log("Calling Gemini API...");
    const result = await model.generateContent(prompt);
    console.log("Received response from Gemini API");

    const response = await result.response;
    const text = response.text();
    console.log("Response text length:", text.length);
    console.log("Response text first 100 chars:", text.substring(0, 100));

    // Clean the response text of any markdown code blocks
    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
    console.log("Cleaned text length:", cleanedText.length);

    // Parse the JSON response
    let content;
    try {
      console.log("Attempting to parse JSON response");
      content = JSON.parse(cleanedText);
      console.log("Successfully parsed JSON");
      console.log("Content keys:", Object.keys(content));
    } catch (error) {
      console.error("Failed to parse AI response as JSON:", error);
      console.error("Error message:", error.message);
      console.log("Raw response:", text);
      console.log("Cleaned response:", cleanedText);

      // Attempt to fix common JSON issues
      try {
        console.log("Attempting secondary JSON parsing with fixes");
        // Try to fix any remaining formatting issues
        const furtherCleanedText = cleanedText
          .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes
          .replace(/[\u2018\u2019]/g, "'") // Replace smart single quotes
          .replace(/\n/g, " ") // Remove newlines
          .trim();
        content = JSON.parse(furtherCleanedText);
        console.log("Secondary parsing successful");
      } catch (secondError) {
        console.error("Failed second attempt to parse JSON:", secondError);
        console.error("Second error message:", secondError.message);
        return NextResponse.json(
          { error: "Invalid response format from AI" },
          { status: 500 }
        );
      }
    }

    console.log("Checking for missing resources");
    // Add default resources if none were generated
    if (!content.studyResources || content.studyResources.length === 0) {
      console.log("No study resources found, adding defaults");
      content.studyResources = [
        {
          title:
            languageName === "English"
              ? "Google Scholar Research"
              : languageName === "Spanish"
              ? "Investigación en Google Scholar"
              : "Recherche Google Scholar",
          url: `https://scholar.google.com/scholar?q=${encodeURIComponent(
            topic
          )}&hl=${validLanguage}`,
          description:
            languageName === "English"
              ? `Latest academic research on ${topic}`
              : languageName === "Spanish"
              ? `Investigación académica reciente sobre ${topic}`
              : `Dernières recherches académiques sur ${topic}`,
        },
        {
          title:
            languageName === "English"
              ? "Coursera Courses"
              : languageName === "Spanish"
              ? "Cursos de Coursera"
              : "Cours Coursera",
          url: `https://www.coursera.org/search?query=${encodeURIComponent(
            topic
          )}&language=${validLanguage}`,
          description:
            languageName === "English"
              ? `Online courses related to ${topic}`
              : languageName === "Spanish"
              ? `Cursos en línea relacionados con ${topic}`
              : `Cours en ligne liés à ${topic}`,
        },
      ];
    } else {
      console.log("Study resources count:", content.studyResources.length);
    }

    if (!content.videoContent || content.videoContent.length === 0) {
      console.log("No video content found, adding defaults");
      content.videoContent = [
        {
          title:
            languageName === "English"
              ? "Educational Lectures"
              : languageName === "Spanish"
              ? "Conferencias Educativas"
              : "Conférences Éducatives",
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
            topic
          )}+lecture&hl=${validLanguage}`,
          description:
            languageName === "English"
              ? `University-level lectures on ${topic}`
              : languageName === "Spanish"
              ? `Conferencias de nivel universitario sobre ${topic}`
              : `Conférences de niveau universitaire sur ${topic}`,
        },
        {
          title:
            languageName === "English"
              ? "Tutorial Videos"
              : languageName === "Spanish"
              ? "Videos de Tutoriales"
              : "Vidéos Tutoriels",
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
            topic
          )}+tutorial&hl=${validLanguage}`,
          description:
            languageName === "English"
              ? `Step-by-step tutorials on ${topic}`
              : languageName === "Spanish"
              ? `Tutoriales paso a paso sobre ${topic}`
              : `Tutoriels étape par étape sur ${topic}`,
        },
      ];
    } else {
      console.log("Video content count:", content.videoContent.length);
    }

    // Before returning the response
    console.log(
      `Generated content in ${languageName}. Content length: ${
        JSON.stringify(content).length
      } characters`
    );
    console.log("Content keys:", Object.keys(content));
    console.log(
      "Detailed notes first 50 chars:",
      content.detailedNotes?.substring(0, 50)
    );

    console.log("Returning response with content");
    return NextResponse.json({ sections: content });
  } catch (error) {
    console.error("Error generating review content:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Failed to generate review content" },
      { status: 500 }
    );
  }
}
