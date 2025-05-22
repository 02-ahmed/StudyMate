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

// Log when the file is first loaded
console.log("=== API ROUTE LOADED ===");
console.log("API_KEY value:", process.env.API_KEY ? "[PRESENT]" : "[MISSING]");

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

    // Extract topic and other parameters from request body
    const { topic, setId, language: requestLanguage = "en" } = requestBody;
    console.log("Extracted topic:", topic);
    console.log("Extracted setId:", setId);
    console.log("Extracted request language:", requestLanguage);

    // Initialize language variable that will be determined by priority:
    // 1. Language from flashcard set (highest priority)
    // 2. Language from request (fallback)
    // 3. Default to English (lowest priority)
    let language = requestLanguage;

    // Try to find the flashcard set using setId (most reliable) or by topic name
    if (userId) {
      console.log(`🔍 Looking for flashcard set for user: ${userId}`);

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
          console.log(`🔍 Looking for flashcard set with ID: "${setId}"`);
          const docRef = doc(db, "users", userId, "flashcardSets", setId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            flashcardSet = docSnap.data();
            console.log(`✅ Found flashcard set with ID: "${setId}"`);
            console.log(
              `Flashcard set name: ${flashcardSet.name || "unnamed"}`
            );
            console.log(
              `Flashcard set language: ${flashcardSet.language || "not set"}`
            );

            // Add the setId to the flashcard set data for reference
            flashcardSet.setId = setId;
          } else {
            console.log(`⚠️ No flashcard set found with ID: "${setId}"`);
          }
        }

        // If no setId or set not found by ID, try to find by name
        if (!flashcardSet && topic) {
          console.log(`🔍 Looking for flashcard set with name: "${topic}"`);
          const q = query(flashcardSetsRef, where("name", "==", topic));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            flashcardSet = snapshot.docs[0].data();
            console.log(`✅ Found flashcard set with name: "${topic}"`);
          } else {
            console.log(`⚠️ No flashcard set found with name: "${topic}"`);
          }
        }

        // If we found a flashcard set, extract its language
        if (flashcardSet) {
          console.log(
            `Flashcard set language: ${flashcardSet.language || "not set"}`
          );
          console.log(`Flashcard set name: ${flashcardSet.name || "unnamed"}`);

          if (flashcardSet.language) {
            language = flashcardSet.language;
            console.log(`📌 Using language from flashcard set: "${language}"`);

            // Add a debug checkpoint to ensure language is preserved
            console.log(
              `🔍 CHECKPOINT - Language after setting from flashcard: "${language}"`
            );
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

    // Add another checkpoint to verify language is still correct before processing
    console.log(`🔍 CHECKPOINT - Language before processing: "${language}"`);

    console.log("========== API REQUEST PROCESSING ==========");
    console.log("Final topic:", topic);
    console.log("Final language:", language);
    console.log("Final language (quoted):", `"${language}"`);
    console.log("Final language type:", typeof language);
    console.log("Is language null?", language === null);
    console.log("Is language undefined?", language === undefined);
    console.log("Is language empty string?", language === "");
    console.log("Language string length:", language ? language.length : 0);
    console.log("===========================================");

    // Add a debug log to trace the language value before validation
    console.log(`🔍 DEBUG - Language before validation: "${language}"`);

    // IMPORTANT: Log the supported languages to see if our language code is valid
    console.log(
      "Supported languages in LANGUAGES object:",
      Object.keys(LANGUAGES)
    );
    console.log("Is language directly in LANGUAGES?", language in LANGUAGES);

    // Check if language is a valid language code but might be in a different format
    // For example, 'es' vs 'es-ES' or 'es_ES'
    let languageMatch = language;
    if (!LANGUAGES[language]) {
      // Try to find a matching language code
      const languageCode = language.split(/[-_]/)[0].toLowerCase();
      console.log(`Trying to match language code: "${languageCode}"`);

      // Check if the base language code exists in our LANGUAGES object
      const matchingKey = Object.keys(LANGUAGES).find(
        (key) =>
          key.toLowerCase() === languageCode ||
          key.split(/[-_]/)[0].toLowerCase() === languageCode
      );

      if (matchingKey) {
        console.log(
          `Found matching language code: "${matchingKey}" for "${language}"`
        );
        languageMatch = matchingKey;
      } else {
        console.log(`No matching language code found for "${language}"`);
      }
    }

    // Ensure we have a valid language code
    // If language is not in our supported languages map, default to English
    const validLanguage = LANGUAGES[languageMatch] ? languageMatch : "en";
    console.log("========== LANGUAGE VALIDATION ==========");
    console.log("Original language from request/flashcard:", language);
    console.log("Language match found:", languageMatch);
    console.log("Final validated language:", validLanguage);
    console.log("Validated language (quoted):", `"${validLanguage}"`);
    console.log("Is language valid?", LANGUAGES[languageMatch] ? "yes" : "no");
    console.log("Supported languages:", Object.keys(LANGUAGES));
    console.log(
      "Is language in supported languages?",
      languageMatch in LANGUAGES
    );
    console.log(
      "Why defaulting to English:",
      !LANGUAGES[languageMatch]
        ? "Language not supported"
        : "Using provided language"
    );

    console.log("========================================");

    const languageName = LANGUAGES[validLanguage] || "English";
    console.log("Language name:", languageName);

    // Add a debug log to trace the language name
    console.log(
      `🔍 DEBUG - Language name for content generation: "${languageName}" (from code: ${validLanguage})`
    );

    console.log("=== GENERATE REVIEW CONTENT API CALLED ===");
    console.log(`Topic: "${topic}"`);
    console.log(`Final language code: "${validLanguage}"`);
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
      }
    }
    
    DO NOT include headers, bullet points, or section markers.
    DO NOT include any text outside of the JSON structure.
    ENSURE all URLs in studyResources and videoContent are real, working URLs.
    ENSURE you include 3-5 relevant resources in both studyResources and videoContent.
    REMEMBER: ALL TEXT MUST BE IN ${languageName.toUpperCase()} - THIS IS THE MOST IMPORTANT REQUIREMENT.
    `;

    console.log("Prompt length:", prompt.length);
    console.log("First 100 chars of prompt:", prompt.substring(0, 100));
    console.log(`Language emphasis: ${languageName.toUpperCase()}`);

    // Call the Gemini API to generate content based on the prompt
    console.log("Calling Gemini API...");
    let response;
    try {
      response = await model.generateContent(prompt);
      console.log("Received response from Gemini API");
      const responseText = response.response.text();
      console.log("Response text length:", responseText.length);
      console.log("First 100 chars:", responseText.substring(0, 100));

      // Clean the response text of any markdown code blocks
      const cleanedText = responseText.replace(/```json\n?|\n?```/g, "").trim();
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
        console.log("Raw response:", responseText);
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
