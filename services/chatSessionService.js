import { db } from "../config/firebase";
import {
  doc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { validateChatSession, createChatSession } from "../utils/schemas";

/**
 * Create a new chat session
 * @param {string} userId - The user's ID
 * @param {object} data - Chat session data
 * @returns {Promise<string>} - The ID of the newly created chat session
 */
export const createNewChatSession = async (userId, data) => {
  try {
    // Create a valid chat session object
    const chatSessionData = createChatSession({
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Validate the chat session data
    if (!validateChatSession(chatSessionData)) {
      throw new Error("Invalid chat session data");
    }

    // Add the document to the chatSessions subcollection
    const userChatSessionsRef = collection(db, "users", userId, "chatSessions");
    const docRef = await addDoc(userChatSessionsRef, chatSessionData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw error;
  }
};

/**
 * Get a chat session by ID
 * @param {string} userId - The user's ID
 * @param {string} sessionId - The chat session ID
 * @returns {Promise<object>} - The chat session data
 */
export const getChatSession = async (userId, sessionId) => {
  try {
    const chatSessionRef = doc(db, "users", userId, "chatSessions", sessionId);
    const chatSessionDoc = await getDoc(chatSessionRef);

    if (!chatSessionDoc.exists()) {
      throw new Error("Chat session not found");
    }

    return { id: chatSessionDoc.id, ...chatSessionDoc.data() };
  } catch (error) {
    console.error("Error getting chat session:", error);
    throw error;
  }
};

/**
 * Get all chat sessions for a user
 * @param {string} userId - The user's ID
 * @param {object} options - Query options (optional)
 * @returns {Promise<Array>} - Array of chat session objects
 */
export const getUserChatSessions = async (userId, options = {}) => {
  try {
    const {
      flashcardSetId,
      orderByField = "updatedAt",
      orderDirection = "desc",
    } = options;

    let chatSessionsQuery;
    const chatSessionsRef = collection(db, "users", userId, "chatSessions");

    if (flashcardSetId) {
      // Get chat sessions for a specific flashcard set
      chatSessionsQuery = query(
        chatSessionsRef,
        where("flashcardSetId", "==", flashcardSetId),
        orderBy(orderByField, orderDirection)
      );
    } else {
      // Get all chat sessions
      chatSessionsQuery = query(
        chatSessionsRef,
        orderBy(orderByField, orderDirection)
      );
    }

    const chatSessionsSnapshot = await getDocs(chatSessionsQuery);
    return chatSessionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting user chat sessions:", error);
    throw error;
  }
};

/**
 * Add a message to a chat session
 * @param {string} userId - The user's ID
 * @param {string} sessionId - The chat session ID
 * @param {object} message - The message to add
 * @returns {Promise<void>}
 */
export const addMessageToChatSession = async (userId, sessionId, message) => {
  try {
    const sessionRef = doc(db, "users", userId, "chatSessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      throw new Error("Chat session not found");
    }

    const currentSession = sessionDoc.data();
    const updatedMessages = [
      ...currentSession.messages,
      {
        ...message,
        timestamp: serverTimestamp(),
      },
    ];

    await updateDoc(sessionRef, {
      messages: updatedMessages,
      messageCount: updatedMessages.length,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding message to chat session:", error);
    throw error;
  }
};

/**
 * Update a chat session
 * @param {string} userId - The user's ID
 * @param {string} sessionId - The chat session ID
 * @param {object} data - The data to update
 * @returns {Promise<void>}
 */
export const updateChatSession = async (userId, sessionId, data) => {
  try {
    const sessionRef = doc(db, "users", userId, "chatSessions", sessionId);

    // Remove fields that shouldn't be directly updated
    const { messages, createdAt, ...updateData } = data;

    await updateDoc(sessionRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating chat session:", error);
    throw error;
  }
};

/**
 * Delete a chat session
 * @param {string} userId - The user's ID
 * @param {string} sessionId - The chat session ID
 * @returns {Promise<void>}
 */
export const deleteChatSession = async (userId, sessionId) => {
  try {
    const sessionRef = doc(db, "users", userId, "chatSessions", sessionId);
    await deleteDoc(sessionRef);
  } catch (error) {
    console.error("Error deleting chat session:", error);
    throw error;
  }
};
