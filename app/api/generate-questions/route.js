import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export async function POST(request) {
  try {
    const { flashcards, numQuestions, questionTypes } = await request.json();

    // Format flashcards into a study material
    const studyMaterial = flashcards
      .map((card) => `Question: ${card.front}\nAnswer: ${card.back}`)
      .join("\n\n");

    // Create prompt for Gemini
    const prompt = `You are an educational question generator. Generate practice questions based on this study material:

Study Material:
${studyMaterial}

Task:
Generate ${numQuestions} questions divided among these types: ${questionTypes.join(
      ", "
    )}

IMPORTANT - Each question MUST follow this EXACT format:

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

Requirements:
1. EVERY question MUST have an explanation field
2. True/False answers MUST be boolean (true/false), not strings
3. Multiple choice MUST have exactly 4 options
4. Return ONLY a JSON array of questions, no markdown or extra text
5. Make questions test understanding, not just memorization
6. Keep questions clear and concise`;

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate questions
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response text
    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();

    try {
      // Parse the cleaned JSON
      const questions = JSON.parse(cleanedText);

      // Validate and fix questions
      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
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
                `Fill in blank question ${index + 1} must have a string answer`
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
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw AI response:", text);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
