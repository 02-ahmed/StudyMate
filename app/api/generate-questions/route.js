import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const MAX_QUESTIONS = 15; // Increased from 10 to 15

export async function POST(request) {
  try {
    const { flashcards, numQuestions, questionTypes } = await request.json();

    // Validate input
    if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty flashcards array" },
        { status: 400 }
      );
    }

    if (!numQuestions || numQuestions < 1) {
      return NextResponse.json(
        { error: "Number of questions must be at least 1" },
        { status: 400 }
      );
    }

    if (numQuestions > MAX_QUESTIONS) {
      return NextResponse.json(
        {
          error: `Cannot generate more than ${MAX_QUESTIONS} questions at once`,
        },
        { status: 400 }
      );
    }

    if (
      !questionTypes ||
      !Array.isArray(questionTypes) ||
      questionTypes.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid question types" },
        { status: 400 }
      );
    }

    // Format flashcards into a study material
    const studyMaterial = flashcards
      .map((card) => `Question: ${card.front}\nAnswer: ${card.back}`)
      .join("\n\n");

    // Create prompt for Gemini
    const prompt = `You are an educational question generator. Generate practice questions based on this study material:

Study Material:
${studyMaterial}

Task:
Generate exactly ${numQuestions} questions using these question types: ${questionTypes.join(
      ", "
    )}

IMPORTANT REQUIREMENTS:
1. Generate EXACTLY ${numQuestions} questions total - this is mandatory
2. Randomly mix the question types - do not try to distribute them evenly
3. Each question should be unique and different from previous generations
4. 80% of questions should be directly from the study material
5. 20% of questions should test broader understanding by:
   - Making connections to related concepts
   - Testing practical applications
   - Asking about implications or consequences
   - Encouraging critical thinking beyond the material
6. Vary the difficulty level of questions
7. Make questions engaging and thought-provoking

Each question MUST follow this EXACT format:

For Multiple Choice:
{
  "type": "multipleChoice",
  "question": "your question here",
  "correctAnswer": "the correct option exactly as it appears in options",
  "options": ["option1", "option2", "option3", "option4"],
  "explanation": "explanation of why the answer is correct"
}

For True/False:
{
  "type": "trueFalse",
  "question": "your statement here",
  "correctAnswer": true or false (must be boolean, not string),
  "explanation": "explanation of why the statement is true or false"
}

For Fill in Blank:
{
  "type": "fillInBlank",
  "question": "question with blank marked by ________",
  "correctAnswer": "the word or phrase that fills the blank",
  "explanation": "explanation of why this is the correct answer"
}

Additional Rules:
1. EVERY question MUST have an explanation field
2. True/False answers MUST be boolean (true/false), not strings
3. Multiple choice MUST have exactly 4 options
4. Return ONLY a JSON array of questions, no markdown or extra text
5. Ensure the response is valid JSON that can be parsed`;

    // Update the model configuration to increase creativity
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.9, // Increase randomness
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    // Generate questions with retry mechanism
    let attempts = 0;
    const maxAttempts = 3;
    let questions;

    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response text
        const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();

        // Parse the cleaned JSON
        questions = JSON.parse(cleanedText);

        // Validate array and length
        if (!Array.isArray(questions)) {
          throw new Error("Response is not an array");
        }

        if (questions.length !== numQuestions) {
          throw new Error(
            `Expected ${numQuestions} questions but got ${questions.length}`
          );
        }

        // Process each question
        const processedQuestions = questions.map((q, index) => {
          // Add default explanation if missing
          if (!q.explanation) {
            q.explanation = `The correct answer is: ${q.correctAnswer}`;
          }

          // Process based on type
          switch (q.type) {
            case "multipleChoice":
              if (!Array.isArray(q.options) || q.options.length !== 4) {
                throw new Error(
                  `Multiple choice question ${
                    index + 1
                  } must have exactly 4 options`
                );
              }
              break;

            case "trueFalse":
              // Convert string true/false to boolean if needed
              if (typeof q.correctAnswer === "string") {
                q.correctAnswer = q.correctAnswer.toLowerCase() === "true";
              }
              if (typeof q.correctAnswer !== "boolean") {
                throw new Error(
                  `True/False question ${index + 1} must have a boolean answer`
                );
              }
              break;

            case "fillInBlank":
              if (typeof q.correctAnswer !== "string") {
                throw new Error(
                  `Fill in blank question ${
                    index + 1
                  } must have a string answer`
                );
              }
              break;

            default:
              throw new Error(
                `Question ${index + 1} has invalid type: ${q.type}`
              );
          }

          return q;
        });

        return NextResponse.json({ questions: processedQuestions });
      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed:`, error);
        attempts++;

        if (attempts === maxAttempts) {
          return NextResponse.json(
            {
              error:
                "Failed to generate valid questions after multiple attempts",
              details: error.message,
            },
            { status: 500 }
          );
        }
      }
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      {
        error: "Failed to generate questions",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
