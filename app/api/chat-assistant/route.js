import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Map of language codes to full language names
const LANGUAGES = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
};

const systemPrompt =
  "You are Flashcard Assistant, a friendly and knowledgeable study companion. Your role is to help users understand their flashcards by providing explanations for concepts, additional context, study tips, and offering guidance on how to improve their learning process. When discussing flashcards, you should reference the current topic whenever possible and provide tailored assistance based on what they're studying. Always aim to provide accurate, helpful information in a supportive and encouraging manner. Important: DO NOT offer to quiz or test the user, as the app already has a dedicated practice test feature for that purpose. You can suggest important concepts to look out for or highlight key ideas, but never create quizzes, tests, or directly test the user's knowledge.";

export async function POST(req) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
    });

    const data = await req.json();
    console.log("Received request with message:", data.msg);

    // Extract language from context
    const userContext = data.context || {};
    const language = userContext.language || "en"; // Default to English if not provided

    // Get full language name from code
    const languageName = LANGUAGES[language] || "English";
    console.log(`Using language: ${language} (${languageName})`);

    // Add current context if available
    let contextPrompt = userContext.currentTopic
      ? `\nThe user is currently studying: ${userContext.currentTopic}.`
      : "";

    // Add language instruction to context prompt
    contextPrompt += `\nIMPORTANT: Please respond in ${languageName} language.`;

    // Add flashcard context if available
    if (userContext.flashcardContext) {
      contextPrompt += `\n\nHere is the content of the flashcards the user is studying:\n${userContext.flashcardContext}`;
    }

    // Process conversation history for the API
    let formattedHistory = [];

    if (
      data.messages &&
      Array.isArray(data.messages) &&
      data.messages.length > 0
    ) {
      console.log(
        `Processing conversation history with ${data.messages.length} messages`
      );

      // Skip any messages that are flagged as welcome messages
      const filteredMessages = data.messages.filter(
        (msg) => !msg.isWelcomeMessage
      );

      // Find the first user message
      let startIndex = 0;
      while (
        startIndex < filteredMessages.length &&
        filteredMessages[startIndex].role !== "user"
      ) {
        startIndex++;
      }

      // Only process history if we have a user message to start with
      if (startIndex < filteredMessages.length) {
        // Format messages for the Google AI API
        for (let i = startIndex; i < filteredMessages.length; i++) {
          const message = filteredMessages[i];

          // Keep roles as they are - Google API expects 'model' not 'assistant'
          const role = message.role; // Keep original role

          // Get text from message parts
          let text = "";
          if (message.parts && message.parts.length > 0) {
            text = message.parts.map((part) => part.text || "").join(" ");
          }

          if (text) {
            formattedHistory.push({
              role: role,
              parts: [{ text: text }],
            });
          }
        }
      }
    }

    // Double-check that history starts with a user message
    if (formattedHistory.length === 0 || formattedHistory[0].role !== "user") {
      console.log(
        "History doesn't start with user message, using single message approach"
      );
      // If not, don't use history (API requirement)
      formattedHistory = [];
    }

    // Truncate conversation history if it's too long (to prevent streaming errors)
    // Keep only the last 10 messages maximum
    if (formattedHistory.length > 10) {
      console.log(
        `Truncating conversation history from ${formattedHistory.length} to 10 messages`
      );
      formattedHistory = formattedHistory.slice(-10);
    }

    console.log(
      `Using conversation history with ${formattedHistory.length} formatted messages`
    );

    // Add context to the user's message if applicable
    const userMessage = contextPrompt
      ? `${contextPrompt}\n\nUser message: ${data.msg}`
      : data.msg;

    // Always use non-streaming approach
    const responseText = await getNonStreamingResponse(
      model,
      formattedHistory,
      userMessage,
      languageName
    );

    // Return a simple JSON response
    return NextResponse.json({
      text: responseText,
    });
  } catch (error) {
    console.error("Error in chat assistant API:", error);
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred",
      },
      {
        status: 500,
      }
    );
  }
}

// Non-streaming response function with retry logic
async function getNonStreamingResponse(
  model,
  formattedHistory,
  userMessage,
  language = "English"
) {
  let responseText;
  let retryCount = 0;
  const MAX_RETRIES = 2;

  // Add language instruction to the content generation prompt
  const languageInstruction = `IMPORTANT: Please respond in ${language} language.`;

  while (retryCount <= MAX_RETRIES) {
    try {
      if (formattedHistory.length >= 2 && formattedHistory[0].role === "user") {
        // We have at least a user-model exchange, use chat
        console.log(
          `Starting chat with history (non-streaming) - attempt ${
            retryCount + 1
          }`
        );

        try {
          const chat = model.startChat({
            history: formattedHistory,
          });

          console.log("Sending message to chat with history");
          console.log(`Using language: ${language}`);
          // Ensure language instruction is included in the message
          const messageWithLanguage = userMessage.includes(
            "IMPORTANT: Please respond in"
          )
            ? userMessage
            : `${userMessage}\n\n${languageInstruction}`;

          const result = await chat.sendMessage(messageWithLanguage);
          responseText = result.response.text();
        } catch (chatError) {
          console.error("Error starting chat with history:", chatError);
          // If there's an error with the history, fall back to single message approach
          console.log("Falling back to single message approach");
          const messageWithLanguage = userMessage.includes(
            "IMPORTANT: Please respond in"
          )
            ? userMessage
            : `${userMessage}\n\n${languageInstruction}`;
          const result = await model.generateContent(messageWithLanguage);
          responseText = result.response.text();
        }
      } else {
        // No history or incomplete history, use single message
        console.log(
          `Using single message without history (non-streaming) - attempt ${
            retryCount + 1
          }`
        );

        const messageWithLanguage = userMessage.includes(
          "IMPORTANT: Please respond in"
        )
          ? userMessage
          : `${userMessage}\n\n${languageInstruction}`;
        const result = await model.generateContent(messageWithLanguage);
        responseText = result.response.text();
      }

      console.log(
        "Generated response:",
        responseText.substring(0, 100) + "..."
      );
      return responseText;
    } catch (error) {
      console.error(
        `Error in non-streaming response (attempt ${retryCount + 1}):`,
        error
      );
      retryCount++;

      // If we've reached max retries, throw a friendly error message
      if (retryCount > MAX_RETRIES) {
        return "Sorry, I encountered an error. Please try again in a moment.";
      }

      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
