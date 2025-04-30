"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  orderBy,
  limit,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../../utils/firebase";
import ReactMarkdown from "react-markdown";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";

export default function ChatAssistant({ userId }) {
  const [loading, setLoading] = useState(true);
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState("");
  const [selectedSetData, setSelectedSetData] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatSessionId, setChatSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [error, setError] = useState(null);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionTracker, setSessionTracker] = useState({});
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Define the maximum number of messages allowed before requiring a reset
  const MAX_MESSAGE_COUNT = 20;
  const isHistoryLimitReached = messages.length >= MAX_MESSAGE_COUNT;

  // Load the user's flashcard sets
  useEffect(() => {
    async function loadFlashcardSets() {
      if (!userId) return;

      try {
        const collectionsRef = collection(db, "users", userId, "flashcardSets");
        const querySnapshot = await getDocs(collectionsRef);

        const sets = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          sets.push({
            id: doc.id,
            name: data.name || doc.id,
            cardCount: data.flashcards ? data.flashcards.length : 0,
            tags: data.tags || [],
          });
        });

        setFlashcardSets(sets);
        setLoading(false);
      } catch (error) {
        console.error("Error loading flashcard sets:", error);
        setLoading(false);
      }
    }

    loadFlashcardSets();
  }, [userId]);

  // Load flashcard set data when selected
  useEffect(() => {
    async function loadFlashcardSetData() {
      if (!userId || !selectedSet) {
        setSelectedSetData(null);
        return;
      }

      setLoadingHistory(true); // Start loading
      setError(null); // Clear any previous errors

      try {
        console.log(`Loading flashcard set data for set ID: ${selectedSet}`);
        console.log(`Current sessionTracker state:`, sessionTracker);

        // Get the flashcard set data
        const docRef = doc(db, "users", userId, "flashcardSets", selectedSet);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSelectedSetData(docSnap.data());

          // Check if we already have a session ID for this set in our tracker
          const trackedSessionId = sessionTracker[selectedSet];

          if (trackedSessionId) {
            console.log(
              `Using tracked session ID for ${
                docSnap.data().name
              }: ${trackedSessionId}`
            );

            try {
              // Try to get the session directly by ID first
              const sessionDocRef = doc(
                db,
                "users",
                userId,
                "chatSessions",
                trackedSessionId
              );
              const sessionDocSnap = await getDoc(sessionDocRef);

              if (sessionDocSnap.exists()) {
                // Found the tracked session, use it
                const sessionData = sessionDocSnap.data();
                setChatSessionId(trackedSessionId);

                // Check if the first message is from the model (welcome message)
                const existingMessages = sessionData.messages || [];
                if (
                  existingMessages.length > 0 &&
                  existingMessages[0].role === "model"
                ) {
                  // Flag the first message as a welcome message
                  existingMessages[0] = {
                    ...existingMessages[0],
                    isWelcomeMessage: true,
                  };
                }
                setMessages(existingMessages);
                console.log(
                  `Loaded tracked chat session for set "${
                    docSnap.data().name
                  }" with ${existingMessages.length} messages`
                );
                setLoadingHistory(false);
                return;
              } else {
                console.log(
                  `Tracked session ID ${trackedSessionId} not found, falling back to query`
                );
                // Session not found (might have been deleted), continue to regular query
              }
            } catch (err) {
              console.error("Error loading tracked session:", err);
              // Continue to regular query as fallback
            }
          }

          // Look for an existing chat session for this flashcard set
          try {
            const chatSessionsRef = collection(
              db,
              "users",
              userId,
              "chatSessions"
            );

            // Simplified query that doesn't require a composite index
            console.log(
              `Querying for chat sessions with flashcardSetId == ${selectedSet}`
            );

            const q = query(
              chatSessionsRef,
              where("flashcardSetId", "==", selectedSet)
            );

            const querySnapshot = await getDocs(q);
            console.log(`Query returned ${querySnapshot.size} documents`);

            // If we have results, find the most recent one ourselves
            if (!querySnapshot.empty) {
              // Sort the results by updatedAt manually (client-side)
              let mostRecentSession = null;
              let mostRecentTime = new Date(0); // Start with oldest possible date

              querySnapshot.forEach((doc) => {
                const data = doc.data();
                const updateTime = data.updatedAt?.toDate() || new Date(0);

                if (updateTime > mostRecentTime) {
                  mostRecentTime = updateTime;
                  mostRecentSession = {
                    id: doc.id,
                    data: data,
                  };
                }
              });

              if (mostRecentSession) {
                const sessionId = mostRecentSession.id;
                const sessionData = mostRecentSession.data;

                console.log(`Found session document with ID: ${sessionId}`);
                console.log(`Session data:`, {
                  flashcardSetId: sessionData.flashcardSetId,
                  messageCount:
                    sessionData.messageCount ||
                    sessionData.messages?.length ||
                    0,
                  createdAt: sessionData.createdAt,
                  updatedAt: sessionData.updatedAt,
                });

                // Found a matching session, load its messages
                setChatSessionId(sessionId);

                // Update session tracker with this session ID
                setSessionTracker((prev) => ({
                  ...prev,
                  [selectedSet]: sessionId,
                }));

                // Check if the first message is from the model (welcome message)
                const existingMessages = sessionData.messages || [];
                if (
                  existingMessages.length > 0 &&
                  existingMessages[0].role === "model"
                ) {
                  // Flag the first message as a welcome message
                  existingMessages[0] = {
                    ...existingMessages[0],
                    isWelcomeMessage: true,
                  };
                }
                setMessages(existingMessages);
                console.log(
                  `Loaded existing chat session for set "${
                    docSnap.data().name
                  }" with ${existingMessages.length} messages`
                );
              } else {
                createWelcomeMessage(docSnap.data().name);
              }
            } else {
              console.log(
                `No chat sessions found for flashcardSetId: ${selectedSet}`
              );
              createWelcomeMessage(docSnap.data().name);
            }
          } catch (queryError) {
            console.error("Error querying chat sessions:", queryError);
            setError(
              "Error loading chat history. Starting a new conversation."
            );
            createWelcomeMessage(docSnap.data().name);
          }
        }
      } catch (error) {
        console.error("Error loading flashcard set data:", error);
        setError("Could not load flashcard data. Please try again later.");
      } finally {
        setLoadingHistory(false);
      }
    }

    // Helper function to create a welcome message
    function createWelcomeMessage(setName) {
      // No matching session found for this set, start fresh with welcome message
      console.log(
        `No existing chat session found for set "${setName}". Creating new session.`
      );
      const welcomeMessage = {
        role: "model",
        parts: [
          {
            text: `Hi! I am your study assistant for the "${setName}" flashcard set. I can help you understand concepts, provide additional context, or offer study tips related to these cards. What would you like to learn more about?\n\n*Note: Free chats are limited to ${MAX_MESSAGE_COUNT} messages. Premium plans with unlimited chats coming soon!*`,
          },
        ],
        timestamp: new Date(),
        isWelcomeMessage: true, // Flag this as a welcome message
      };
      setMessages([welcomeMessage]);
      setChatSessionId(null);
    }

    loadFlashcardSetData();
  }, [userId, selectedSet, sessionTracker]);

  // Improved scroll to bottom of messages that works reliably
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Use a useEffect to scroll to bottom whenever messages change or streaming updates
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || sending || !selectedSet) return;

    setSending(true);
    setError(null); // Clear any previous errors
    let userMessageObj = null;
    let retryCount = 0;
    const MAX_RETRIES = 2;

    try {
      // Add user message to state
      userMessageObj = {
        role: "user",
        parts: [{ text: message }],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessageObj]);

      // Reset streaming state - keeping for compatibility but won't use streaming
      setStreamingMessage("");
      setIsStreaming(false); // Changed to false since we're disabling streaming

      // Clear input
      setMessage("");

      // Scroll to bottom after adding the user message
      scrollToBottom();

      // Prepare flashcard context
      let flashcardContext = "";
      if (selectedSetData && selectedSetData.flashcards) {
        flashcardContext = "Here are the flashcards in this set:\n\n";
        selectedSetData.flashcards.forEach((card, index) => {
          flashcardContext += `Card ${index + 1}:\n`;
          flashcardContext += `- Front: ${card.front}\n`;
          flashcardContext += `- Back: ${card.back}\n\n`;
        });
      }

      // Get the current messages
      const currentMessages = messages.concat(userMessageObj);

      // Filter out welcome messages and format for API
      const messagesToSend = currentMessages
        .filter((msg) => !msg.isWelcomeMessage)
        .map((msg) => ({
          role: msg.role,
          parts: msg.parts,
          // Don't include the isWelcomeMessage flag
        }));

      // For streaming implementation
      // Initialize a modelMessage that will be built gradually
      const modelMessage = {
        role: "model",
        parts: [{ text: "" }],
        timestamp: new Date(),
      };

      // Add empty model message to state
      setMessages((prev) => [...prev, modelMessage]);

      // Attempt with retry logic
      const sendRequest = async () => {
        try {
          // Submit the message with conversation history to the API
          const response = await fetch("/api/chat-assistant", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: messagesToSend,
              msg: message,
              context: {
                currentTopic: selectedSetData?.name || "",
                flashcardContext: flashcardContext,
              },
              stream: false, // Disabled streaming mode
            }),
          });

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ error: "Failed to parse error response" }));
            throw new Error(
              errorData.error ||
                `Server responded with status: ${response.status}`
            );
          }

          // Handle non-streaming response
          const data = await response.json();
          return data.text || "";
        } catch (requestError) {
          console.error(`Request error (retry ${retryCount}):`, requestError);

          if (retryCount < MAX_RETRIES) {
            retryCount++;

            // Wait briefly and retry
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return await sendRequest();
          }

          throw requestError;
        }
      };

      // Start the request with non-streaming
      const finalAssistantResponse = await sendRequest();

      // Update the AI response in the UI (final version)
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          parts: [{ text: finalAssistantResponse }],
        };
        return updatedMessages;
      });

      // Save chat session to Firestore
      // Keep all messages including welcome messages for display purposes
      const finalMessages = messages.concat([
        userMessageObj,
        {
          role: "model",
          parts: [{ text: finalAssistantResponse }],
          timestamp: new Date(),
        },
      ]);

      if (chatSessionId) {
        // Update existing session
        const sessionRef = doc(
          db,
          "users",
          userId,
          "chatSessions",
          chatSessionId
        );
        console.log(`Updating existing chat session: ${chatSessionId}`);
        await updateDoc(sessionRef, {
          messages: finalMessages,
          updatedAt: serverTimestamp(),
          messageCount: finalMessages.length,
        });
      } else {
        // Create new session
        console.log(
          `Creating new chat session for flashcard set: ${selectedSet}`
        );
        const chatSessionsRef = collection(db, "users", userId, "chatSessions");
        const newSession = await addDoc(chatSessionsRef, {
          name: `Chat about ${selectedSetData?.name || "flashcards"}`,
          flashcardSetId: selectedSet,
          flashcardSetName: selectedSetData?.name || "Unknown Set",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          tags: selectedSetData?.tags || [],
          messages: finalMessages,
          messageCount: finalMessages.length,
        });
        const newSessionId = newSession.id;
        setChatSessionId(newSessionId);

        // Update session tracker with this new session ID
        setSessionTracker((prev) => ({
          ...prev,
          [selectedSet]: newSessionId,
        }));
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Show error in chat
      setMessages((prev) => {
        const newMessages = [...prev];
        // Find the model message if it exists and replace with error
        const lastMessageIndex = newMessages.length - 1;
        if (
          lastMessageIndex >= 0 &&
          newMessages[lastMessageIndex].role === "model"
        ) {
          newMessages[lastMessageIndex] = {
            role: "model",
            parts: [
              {
                text: "Sorry, there was an error processing your request. Please try again in a moment.",
              },
            ],
            timestamp: new Date(),
          };
        } else {
          // If no model message exists, add a new error message
          newMessages.push({
            role: "model",
            parts: [
              {
                text: "Sorry, there was an error processing your request. Please try again in a moment.",
              },
            ],
            timestamp: new Date(),
          });
        }
        return newMessages;
      });

      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Add a function to handle clearing chat history
  const handleClearChatHistory = async () => {
    try {
      // Get the flashcard set name before clearing
      const setName = selectedSetData?.name || "flashcards";

      // Show a welcome message with no apostrophes or special characters
      const welcomeMessage = {
        role: "model",
        parts: [
          {
            text:
              "The conversation history has been cleared. We can continue discussing the " +
              setName +
              " flashcard set. What would you like to know?\n\n*Note: Free chats are limited to " +
              MAX_MESSAGE_COUNT +
              " messages. Premium plans with unlimited chats coming soon!*",
          },
        ],
        timestamp: new Date(),
        isWelcomeMessage: true,
      };

      // Reset chat state
      setMessages([welcomeMessage]);
      setError(null);

      // FREE TIER APPROACH: Reuse the existing chat session document instead of creating a new one
      if (chatSessionId) {
        // Update the existing session with only the welcome message
        const sessionRef = doc(
          db,
          "users",
          userId,
          "chatSessions",
          chatSessionId
        );
        console.log(`Clearing existing chat session: ${chatSessionId}`);
        await updateDoc(sessionRef, {
          messages: [welcomeMessage],
          updatedAt: serverTimestamp(),
          messageCount: 1,
        });
      } else {
        // If there's no existing session, create a new one
        console.log(
          `Creating new chat session for flashcard set: ${selectedSet}`
        );
        const chatSessionsRef = collection(db, "users", userId, "chatSessions");
        const newSession = await addDoc(chatSessionsRef, {
          name: `Chat about ${setName}`,
          flashcardSetId: selectedSet,
          flashcardSetName: setName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          tags: selectedSetData?.tags || [],
          messages: [welcomeMessage],
          messageCount: 1,
        });

        const newSessionId = newSession.id;
        setChatSessionId(newSessionId);

        // Update the session tracker with the new session ID
        setSessionTracker((prev) => ({
          ...prev,
          [selectedSet]: newSessionId,
        }));
      }

      /* 
      // PAID TIER APPROACH (keep for future implementation):
      // This creates a new chat session document each time, preserving history
      // for paid users who will be able to access previous chat sessions.
      
      const chatSessionsRef = collection(db, "users", userId, "chatSessions");
      const newSession = await addDoc(chatSessionsRef, {
        name: `Chat about ${setName}`,
        flashcardSetId: selectedSet,
        flashcardSetName: setName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tags: selectedSetData?.tags || [],
        messages: [welcomeMessage],
        messageCount: 1,
      });

      const newSessionId = newSession.id;
      // Update session ID
      setChatSessionId(newSessionId);

      // Update the session tracker with the new session ID
      setSessionTracker((prev) => ({
        ...prev,
        [selectedSet]: newSessionId,
      }));
      */

      // Scroll to bottom
      scrollToBottom();
    } catch (error) {
      console.error("Error clearing chat history:", error);
      setError("Failed to clear chat history. Please try again.");
    }
  };

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      sx={{
        background: "linear-gradient(to bottom, #f8fafc, #f1f5f9)",
      }}
    >
      {/* Header with title and selector */}
      <Box
        sx={{
          width: "100%",
          p: 1.5,
          borderBottom: 1,
          borderColor: "rgba(0,0,0,0.1)",
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box
          sx={{
            maxWidth: "800px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="h6"
            fontWeight="600"
            sx={{
              background: "linear-gradient(to right, #2563eb, #4457c0)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Study Chat
          </Typography>
          <FormControl
            size="small"
            sx={{
              minWidth: 200,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          >
            <InputLabel id="flashcard-set-label">Flashcard Set</InputLabel>
            <Select
              labelId="flashcard-set-label"
              value={selectedSet}
              onChange={(e) => {
                console.log(`Flashcard set changed to: ${e.target.value}`);
                setSelectedSet(e.target.value);
              }}
              label="Flashcard Set"
              disabled={loading}
            >
              {flashcardSets.map((set) => (
                <MenuItem key={set.id} value={set.id}>
                  {set.name} ({set.cardCount} cards)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Main chat area container */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          p: 2,
          overflow: "hidden",
        }}
      >
        <Stack
          direction="column"
          width="100%"
          maxWidth="800px"
          spacing={2}
          borderRadius="12px"
          bgcolor="background.paper"
          overflow="hidden"
          sx={{
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {/* Messages scrollable area */}
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            p={3}
            ref={messagesContainerRef}
            sx={{
              scrollbarWidth: "thin",
              scrollbarColor: "#94a3b8 transparent",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#94a3b8",
                borderRadius: "24px",
              },
            }}
          >
            {loadingHistory ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  opacity: 0.7,
                }}
              >
                <CircularProgress size={40} color="primary" sx={{ mb: 2 }} />
                <Typography
                  variant="body1"
                  color="textSecondary"
                  align="center"
                >
                  Loading chat history...
                </Typography>
              </Box>
            ) : messages.length > 0 ? (
              <>
                {error && (
                  <Box
                    sx={{
                      display: "flex",
                      p: 2,
                      mb: 2,
                      backgroundColor: "rgba(254, 226, 226, 0.5)",
                      borderRadius: 2,
                      border: "1px solid #f87171",
                    }}
                  >
                    <Typography color="error" variant="body2">
                      {error}
                    </Typography>
                  </Box>
                )}
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent={
                      message.role === "user" ? "flex-end" : "flex-start"
                    }
                    paddingX={1}
                  >
                    <Box
                      bgcolor={message.role === "user" ? "#4457c0" : "white"}
                      color={message.role === "user" ? "white" : "inherit"}
                      borderRadius="16px"
                      p={2}
                      maxWidth="80%"
                      sx={{
                        position: "relative",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        backdropFilter: "blur(10px)",
                        border:
                          message.role === "user"
                            ? "none"
                            : "1px solid #e0e0e0",
                        "& p": { m: 0 },
                        "& ul, & ol": {
                          paddingLeft: "20px",
                          m: 0,
                        },
                      }}
                    >
                      <ReactMarkdown>{message.parts[0].text}</ReactMarkdown>
                    </Box>
                  </Box>
                ))}

                {/* Show message limit warning if needed */}
                {isHistoryLimitReached && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 3,
                      backgroundColor: "rgba(255, 244, 229, 0.7)",
                      borderRadius: 2,
                      border: "1px solid #f8d486",
                      mt: 2,
                    }}
                  >
                    <Typography
                      variant="body1"
                      align="center"
                      gutterBottom
                      color="warning.dark"
                      fontWeight="bold"
                    >
                      You&apos;ve reached the maximum conversation length
                    </Typography>
                    <Typography
                      variant="body2"
                      align="center"
                      sx={{ mb: 1 }}
                      color="text.secondary"
                    >
                      To continue chatting effectively and avoid memory issues,
                      please clear the conversation history.
                    </Typography>
                    <Typography
                      variant="body2"
                      align="center"
                      sx={{ mb: 2 }}
                      color="text.secondary"
                      fontStyle="italic"
                    >
                      Coming soon: Our premium subscription will allow for
                      longer conversations and access to your complete chat
                      history!
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleClearChatHistory}
                      sx={{ minWidth: 200 }}
                    >
                      Clear Conversation History
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  opacity: 0.7,
                }}
              >
                <QuestionAnswerOutlinedIcon
                  sx={{ fontSize: 42, mb: 1, color: "#4457c0" }}
                />
                <Typography
                  variant="body1"
                  color="textSecondary"
                  align="center"
                >
                  Select a flashcard set and start a conversation
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  align="center"
                  sx={{ mt: 1, maxWidth: 450 }}
                >
                  Ask questions about your flashcards, get explanations for
                  concepts, receive study and retention tips, or learn about
                  related topics. For testing your knowledge, use the Practice
                  Tests feature.
                </Typography>
              </Box>
            )}

            {/* Add spacer at the end to help with scrolling */}
            <div ref={messagesEndRef} style={{ height: "10px" }} />

            {sending && !isStreaming && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CircularProgress size={24} color="primary" />
              </Box>
            )}
          </Stack>

          {/* Input area */}
          <Stack
            direction="column"
            spacing={0.5}
            sx={{
              borderTop: 1,
              borderColor: "rgba(0,0,0,0.1)",
              background: "rgba(255,255,255,0.8)",
            }}
          >
            {/* Chatto-AI attribution - more compact */}
            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
              sx={{ fontSize: "0.6rem", opacity: 0.6, pt: 0.5 }}
            >
              Powered by{" "}
              <a
                href="https://chatto-ai.techloft.org/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit" }}
              >
                Chatto-AI
              </a>
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" p={3} pt={1}>
              {isHistoryLimitReached ? (
                <Box sx={{ width: "100%", textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                    fontStyle="italic"
                  >
                    Coming soon: Premium subscription with unlimited chat
                    history!
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleClearChatHistory}
                    sx={{ py: 1.5 }}
                  >
                    Clear History to Continue Chatting
                  </Button>
                </Box>
              ) : (
                <>
                  <TextField
                    label="Send a message..."
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={sending || !selectedSet}
                    variant="outlined"
                    size="medium"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(0,0,0,0.02)",
                        borderRadius: "12px",
                      },
                    }}
                  />
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sending || !selectedSet}
                    sx={{
                      backgroundColor: "#4457c0",
                      color: "white",
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      "&:hover": {
                        backgroundColor: "#3949ab",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: "rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
