import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/utils/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

export const maxDuration = 60;

// Map of language codes to full language names
const LANGUAGES = {
  en: "English",
  "en-US": "English",
  "en-GB": "English",
  es: "Spanish",
  "es-ES": "Spanish",
  "es-MX": "Spanish",
  "es-419": "Spanish", // Latin American Spanish
  fr: "French",
  "fr-FR": "French",
  "fr-CA": "French",
  de: "German",
  "de-DE": "German",
  it: "Italian",
  pt: "Portuguese",
  "pt-BR": "Portuguese",
  ru: "Russian",
  zh: "Chinese",
  "zh-CN": "Chinese",
  ja: "Japanese",
  ko: "Korean",
};

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export async function POST(request) {
  try {
    const requestBody = await request.json();

    // Extract userId from headers if available
    const userId = request.headers.get("x-user-id") || null;

    // Extract topic and other parameters from request body
    const { topic, setId, language: requestLanguage = "en" } = requestBody;

    // Initialize language variable that will be determined by priority:
    // 1. Language from flashcard set (highest priority)
    // 2. Language from request (fallback)
    // 3. Default to English (lowest priority)
    let language = requestLanguage;

    // Try to find the flashcard set using setId (most reliable) or by topic name
    if (userId) {
      try {
        const flashcardSetsRef = collection(
          db,
          "users",
          userId,
          "flashcardSets"
        );
        let flashcardSet = null;

        // First try to find by setId if available (most reliable)
        if (setId) {
          const docRef = doc(db, "users", userId, "flashcardSets", setId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            flashcardSet = docSnap.data();

            flashcardSet.setId = setId;
          } else {
            console.log(`⚠️ No flashcard set found with ID: "${setId}"`);
          }
        }

        // If no setId or set not found by ID, try to find by name
        if (!flashcardSet && topic) {
          const q = query(flashcardSetsRef, where("name", "==", topic));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            flashcardSet = snapshot.docs[0].data();
          } else {
            console.log(`⚠️ No flashcard set found with name: "${topic}"`);
          }
        }

        // If we found a flashcard set, extract its language
        if (flashcardSet) {
          if (flashcardSet.language) {
            language = flashcardSet.language;

            // Add a debug checkpoint to ensure language is preserved
          } else {
            console.log(
              `⚠️ Flashcard set doesn't have a language set, using request language: "${language}"`
            );
          }
        } else {
          console.log(
            `⚠️ No flashcard set found, using request language: "${language}"`
          );
        }
      } catch (error) {
        console.error("Error finding flashcard set:", error);
        console.log(
          `⚠️ Error looking up flashcard set, using request language: "${language}"`
        );
      }
    } else {
      console.log(`⚠️ Missing userId, using request language: "${language}"`);
    }

    // Log flashcard sets on the server side if we have a user ID
    if (userId) {
      try {
        if (!userId || typeof userId !== "string" || userId.length === 0) {
        } else {
          console.log("✅ User ID format is valid for Firestore query");

          try {
            const flashcardSetsRef = collection(
              db,
              "users",
              userId,
              "flashcardSets"
            );

            try {
              const snapshot = await getDocs(flashcardSetsRef);

              if (snapshot.empty) {
              } else {
                console.log(
                  `✅ Successfully found ${snapshot.size} flashcard sets`
                );

                let index = 0;
                snapshot.forEach((docSnap) => {
                  index++;
                  const data = docSnap.data();
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
    }

    // Check if language is a valid language code but might be in a different format
    // For example, 'es' vs 'es-ES' or 'es_ES'
    let languageMatch = language;
    if (!LANGUAGES[language]) {
      // Try to find a matching language code
      const languageCode = language.split(/[-_]/)[0].toLowerCase();

      // Check if the base language code exists in our LANGUAGES object
      const matchingKey = Object.keys(LANGUAGES).find(
        (key) =>
          key.toLowerCase() === languageCode ||
          key.split(/[-_]/)[0].toLowerCase() === languageCode
      );

      if (matchingKey) {
        languageMatch = matchingKey;
      } else {
        console.log(`No matching language code found for "${language}"`);
      }
    }

    // Ensure we have a valid language code
    // If language is not in our supported languages map, default to English
    const validLanguage = LANGUAGES[languageMatch] ? languageMatch : "en";

    const languageName = LANGUAGES[validLanguage] || "English";

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

    // Create an enhanced prompt for generating review content in the specified language
    const prompt = `
    You are a professional educator specializing in creating comprehensive study guides.
    Create a detailed study guide about "${topic}" in ${languageName}.
    
    CRITICAL REQUIREMENTS:
    - ALL TEXT CONTENT MUST BE WRITTEN ENTIRELY IN ${languageName.toUpperCase()} LANGUAGE.
    - YOU MUST USE THE ${languageName.toUpperCase()} LANGUAGE FOR ALL TEXT CONTENT WITHOUT EXCEPTION.
    - RESPONSE MUST BE A VALID JSON OBJECT with the following structure:
    {
      "detailedNotes": "Comprehensive notes covering all key aspects of the topic. Must be at least 300 words. MUST BE IN ${languageName.toUpperCase()}.",
      "explanations": "Clear explanations of the most important concepts. Must be at least 200 words. MUST BE IN ${languageName.toUpperCase()}.",
      "studyResources": [
        {
          "title": "Resource title IN ${languageName.toUpperCase()}",
          "description": "Brief description of the resource IN ${languageName.toUpperCase()}",
          "url": "https://example.com/resource"
        },
        // 3-5 relevant resources
      ],
      "videoContent": [
        {
          "title": "Video title IN ${languageName.toUpperCase()}",
          "description": "Brief description of the video IN ${languageName.toUpperCase()}",
          "url": "https://example.com/video"
        },
        // 3-5 relevant videos
      ],
      "practiceContent": {
        "questions": [
          {
            "question": "Practice question about the topic IN ${languageName.toUpperCase()}?",
            "answer": "Detailed answer to the practice question IN ${languageName.toUpperCase()}."
          },
          // 5-7 practice questions
        ]
      },
      "practiceQuestions": [
        {
          "question": "Question text IN ${languageName.toUpperCase()}",
          "options": [
            "Option 1 IN ${languageName.toUpperCase()}",
            "Option 2 IN ${languageName.toUpperCase()}",
            "Option 3 IN ${languageName.toUpperCase()}",
            "Option 4 IN ${languageName.toUpperCase()}"
          ],
          "correctAnswer": "Correct answer IN ${languageName.toUpperCase()}"
        }
        // 5-10 practice questions
      ]
    }
    
    IMPORTANT: 
    - Ensure the JSON is well-formed and can be parsed directly.
    - Do not include any text or formatting outside of the main JSON object.
    - Validate the JSON structure before outputting.
    `;

    // Use streaming for the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await model.generateContentStream({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          });

          // Stream the response from the AI
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(new TextEncoder().encode(chunkText));
          }

          controller.close();
        } catch (error) {
          console.error("Error generating review content:", error);
          const errorJson = JSON.stringify({
            error: "Error generating review content",
            details: error.message,
          });
          controller.enqueue(new TextEncoder().encode(errorJson));
          controller.close();
        }
      },
    });

    // Return a streaming response
    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error in generate-review-content:", error);
    return NextResponse.json(
      { error: "Failed to generate review content", details: error.message },
      { status: 500 }
    );
  }
}
