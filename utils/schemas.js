/**
 * Schema definitions and validation for Firebase collections
 * This file centralizes all data structure definitions to ensure consistency
 */

/**
 * Validates a flashcard set document
 * @param {Object} data - The flashcard set data to validate
 * @returns {boolean} - Whether the data is valid
 */
export function validateFlashcardSet(data) {
  // Required fields
  if (!data.name || typeof data.name !== "string") return false;
  if (!data.createdAt) return false; // Timestamp validation
  if (!Array.isArray(data.flashcards)) return false;

  // Validate each flashcard
  for (const card of data.flashcards) {
    if (!card.front || typeof card.front !== "string") return false;
    if (!card.back || typeof card.back !== "string") return false;
    if (typeof card.id !== "number") return false;
  }

  // Tags are optional but must be an array when present
  if (data.tags && !Array.isArray(data.tags)) return false;

  return true;
}

/**
 * Validates a test result document
 * @param {Object} data - The test result data to validate
 * @returns {boolean} - Whether the data is valid
 */
export function validateTestResult(data) {
  // Check required fields
  if (!data.userId || typeof data.userId !== "string") return false;
  if (!data.flashcardSetId || typeof data.flashcardSetId !== "string")
    return false;
  if (!data.setName || typeof data.setName !== "string") return false;
  if (!data.dateTaken) return false; // Timestamp validation
  if (typeof data.score !== "number") return false;
  if (typeof data.totalQuestions !== "number") return false;
  if (typeof data.correctAnswers !== "number") return false;

  // Validate question details
  if (!Array.isArray(data.questionDetails)) return false;
  for (const question of data.questionDetails) {
    if (
      !question.type ||
      (question.type !== "multipleChoice" &&
        question.type !== "trueFalse" &&
        question.type !== "fillInBlank")
    )
      return false;
    if (!question.question || typeof question.question !== "string")
      return false;

    // Check correctAnswer type based on question type
    if (
      question.type === "trueFalse" &&
      typeof question.correctAnswer !== "boolean"
    )
      return false;
    if (
      question.type !== "trueFalse" &&
      typeof question.correctAnswer !== "string"
    )
      return false;

    // Check userAnswer if provided
    if (question.userAnswer !== undefined) {
      if (
        question.type === "trueFalse" &&
        typeof question.userAnswer !== "boolean"
      )
        return false;
      if (
        question.type !== "trueFalse" &&
        typeof question.userAnswer !== "string"
      )
        return false;
    }

    if (typeof question.isCorrect !== "boolean") return false;
  }

  // Optional fields validation
  if (data.tags && !Array.isArray(data.tags)) return false;
  if (data.type && typeof data.type !== "string") return false;
  if (data.isNewDay !== undefined && typeof data.isNewDay !== "boolean")
    return false;

  return true;
}

/**
 * Validates a chat session document
 * @param {Object} data - The chat session data to validate
 * @returns {boolean} - Whether the data is valid
 */
export function validateChatSession(data) {
  // Required fields
  const requiredFields = [
    "name",
    "flashcardSetId",
    "createdAt",
    "updatedAt",
    "messages",
  ];

  // Check if all required fields are present
  const hasAllRequiredFields = requiredFields.every(
    (field) =>
      data.hasOwnProperty(field) &&
      data[field] !== null &&
      data[field] !== undefined
  );

  if (!hasAllRequiredFields) return false;

  // Additional validations
  if (typeof data.name !== "string" || data.name.trim() === "") return false;
  if (
    typeof data.flashcardSetId !== "string" ||
    data.flashcardSetId.trim() === ""
  )
    return false;

  // Validate messages array
  if (!Array.isArray(data.messages)) return false;
  for (const message of data.messages) {
    if (!validateChatMessage(message)) return false;
  }

  // Optional fields validation
  if (data.flashcardSetName && typeof data.flashcardSetName !== "string")
    return false;
  if (data.tags && !Array.isArray(data.tags)) return false;
  if (data.messageCount !== undefined && typeof data.messageCount !== "number")
    return false;

  return true;
}

/**
 * Validates a chat message object structure
 * @param {Object} message - The message object to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateChatMessage(message) {
  // Required message fields
  const requiredFields = ["role", "timestamp", "parts"];

  // Check if all required fields are present
  const hasAllRequiredFields = requiredFields.every(
    (field) =>
      message.hasOwnProperty(field) &&
      message[field] !== null &&
      message[field] !== undefined
  );

  if (!hasAllRequiredFields) return false;

  // Role must be either 'user' or 'assistant'
  if (!["user", "assistant", "model"].includes(message.role)) return false;

  // Parts must be an array and contain at least one part
  if (!Array.isArray(message.parts) || message.parts.length === 0) return false;

  // Each part must have a text property
  for (const part of message.parts) {
    if (
      typeof part !== "object" ||
      !part.text ||
      typeof part.text !== "string"
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Creates a new flashcard set with validated structure
 * @param {Object} data - The flashcard set data
 * @returns {Object} - A properly structured flashcard set
 */
export function createFlashcardSet(data) {
  return {
    name: data.name || "Untitled Set",
    createdAt: data.createdAt || new Date(),
    tags: Array.isArray(data.tags) ? data.tags : [],
    flashcards: Array.isArray(data.flashcards)
      ? data.flashcards.map((card, index) => ({
          front: card.front || "",
          back: card.back || "",
          id: typeof card.id === "number" ? card.id : index,
        }))
      : [],
  };
}

/**
 * Creates a new test result with validated structure
 * @param {Object} data - The test result data
 * @returns {Object} - A properly structured test result
 */
export function createTestResult(data) {
  return {
    userId: data.userId,
    flashcardSetId: data.flashcardSetId,
    setName: data.setName || "Untitled Set",
    dateTaken: data.dateTaken || new Date(),
    score: typeof data.score === "number" ? data.score : 0,
    timeSpentSeconds:
      typeof data.timeSpentSeconds === "number" ? data.timeSpentSeconds : 0,
    totalQuestions:
      typeof data.totalQuestions === "number" ? data.totalQuestions : 0,
    correctAnswers:
      typeof data.correctAnswers === "number" ? data.correctAnswers : 0,
    tags: Array.isArray(data.tags) ? data.tags : [],
    type: data.type || "practice_test",
    isNewDay: typeof data.isNewDay === "boolean" ? data.isNewDay : false,
    questionDetails: Array.isArray(data.questionDetails)
      ? data.questionDetails.map((question) => ({
          type: question.type,
          question: question.question,
          correctAnswer: question.correctAnswer,
          userAnswer: question.userAnswer,
          isCorrect:
            typeof question.isCorrect === "boolean"
              ? question.isCorrect
              : false,
          tags: Array.isArray(question.tags) ? question.tags : [],
        }))
      : [],
  };
}

/**
 * Creates a new chat session with validated structure
 * @param {Object} data - The chat session data
 * @returns {Object} - A properly structured chat session
 */
export function createChatSession(data) {
  return {
    name: data.name || "Untitled Chat",
    flashcardSetId: data.flashcardSetId,
    flashcardSetName: data.flashcardSetName || "Unknown Set",
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    tags: Array.isArray(data.tags) ? data.tags : [],
    messages: Array.isArray(data.messages)
      ? data.messages.map((message) => ({
          role: message.role,
          parts: Array.isArray(message.parts)
            ? message.parts.map((part) => ({
                text: part.text || "",
              }))
            : [{ text: "" }],
          timestamp: message.timestamp || new Date(),
        }))
      : [],
    messageCount:
      typeof data.messageCount === "number"
        ? data.messageCount
        : Array.isArray(data.messages)
        ? data.messages.length
        : 0,
    lastMessage:
      data.messages && data.messages.length > 0
        ? data.messages[data.messages.length - 1]
        : null,
  };
}

/**
 * Creates a new chat message object
 * @param {string} role - The role of the message sender ('user' or 'assistant')
 * @param {string} text - The message text content
 * @param {Object} timestamp - The timestamp for the message
 * @returns {Object} - Complete chat message object
 */
export function createChatMessage(role, text, timestamp) {
  return {
    role,
    timestamp,
    parts: [{ text }],
  };
}

/**
 * Schema definitions as JavaScript objects for reference
 */
export const SCHEMAS = {
  flashcardSet: {
    name: "string",
    createdAt: "timestamp",
    tags: "array<string>",
    flashcards: "array<{front: string, back: string, id: number}>",
  },

  testResult: {
    userId: "string",
    flashcardSetId: "string",
    setName: "string",
    dateTaken: "timestamp",
    score: "number",
    timeSpentSeconds: "number",
    totalQuestions: "number",
    correctAnswers: "number",
    tags: "array<string>",
    type: "string",
    isNewDay: "boolean",
    questionDetails:
      "array<{type: string, question: string, correctAnswer: string|boolean, userAnswer: string|boolean, isCorrect: boolean, tags: array<string>}>",
  },

  chatSession: {
    name: "string",
    flashcardSetId: "string",
    flashcardSetName: "string",
    createdAt: "timestamp",
    updatedAt: "timestamp",
    tags: "array<string>",
    messages:
      "array<{role: string, parts: array<{text: string}>, timestamp: timestamp}>",
    messageCount: "number",
  },
};
