"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  Snackbar,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ArticleIcon from "@mui/icons-material/Article";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import SaveIcon from "@mui/icons-material/Save";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../../utils/firebase";
import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { useLanguage } from "../contexts/LanguageContext";
import useTranslation from "../hooks/useTranslation";

// Import the same section components used in the dialog
import NotesSection from "../components/review/NotesSection";
import ExplanationsSection from "../components/review/ExplanationsSection";
import ResourcesSection from "../components/review/ResourcesSection";
import PracticeSection from "../components/review/PracticeSection";

export default function ReviewContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { t } = useTranslation();

  const loadContent = useCallback(
    async (topics) => {
      try {
        setLoading(true);
        setError(null);

        // First try to get content from sessionStorage (this is the content from the dialog)
        try {
          const storedContent = sessionStorage.getItem("currentReviewContent");
          if (storedContent) {
            const parsedContent = JSON.parse(storedContent);
            setContent(parsedContent);
            setLoading(false);

            // Don't remove from sessionStorage in case user refreshes the page

            return;
          }
        } catch (storageError) {
          console.error("Error accessing sessionStorage:", storageError);
        }

        // If we're here, there's no content in sessionStorage
        // Only load from database or generate if this is not from the "View Full Page" button
        if (!topics[0].useStoredContent) {
          // Find saved content in database - use the exact review ID from the URL if provided
          const urlParams = new URLSearchParams(window.location.search);
          const reviewId = urlParams.get("reviewId");

          let savedReview = null;

          if (reviewId) {
            // If a specific review ID is provided, fetch that exact review
            try {
              const reviewRef = doc(
                db,
                "users",
                user.id,
                "savedReviews",
                reviewId
              );
              const reviewSnap = await getDoc(reviewRef);

              if (reviewSnap.exists()) {
                savedReview = { id: reviewSnap.id, ...reviewSnap.data() };
              }
            } catch (error) {
              console.error("Error fetching specific review:", error);
            }
          }

          // If no review ID was provided or the specific review wasn't found, try to find by topic
          if (!savedReview) {
            const reviewsRef = collection(db, "users", user.id, "savedReviews");

            // Get the topic value, handling both string and object cases
            const topicValue =
              typeof topics[0].topic === "string"
                ? topics[0].topic
                : topics[0].topic?.name ||
                  topics[0].topic?.topic ||
                  "Unknown Topic";

            // Try different query approaches
            const queryAttempts = [
              // Direct topic match in topics array using array-contains
              query(
                reviewsRef,
                where("topics", "array-contains", { topic: topicValue })
              ),
              // Try with just the string value
              query(reviewsRef, where("topics", "array-contains", topicValue)),
              // Topic field direct match
              query(reviewsRef, where("topic", "==", topicValue)),
            ];

            for (const q of queryAttempts) {
              try {
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                  savedReview = querySnapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => {
                      // Sort by updatedAt if available, otherwise fall back to createdAt
                      const dateA = b.updatedAt || b.createdAt;
                      const dateB = a.updatedAt || a.createdAt;
                      return dateA - dateB;
                    })[0];
                  break;
                }
              } catch (err) {
                console.error("Error in query attempt:", err);
                // Continue to the next query attempt
              }
            }
          }

          if (savedReview) {
            // Add debug information about found review
            console.log("Found saved review:", {
              id: savedReview.id,
              topic: savedReview.topics?.[0]?.topic || "Unknown",
              hasContent: !!savedReview.content,
              contentType: savedReview.content
                ? typeof savedReview.content
                : "N/A",
              hasSections: savedReview.content?.sections ? "Yes" : "No",
            });

            // Check if content is an object with a sections property
            if (savedReview.content && savedReview.content.sections) {
              setContent({ sections: savedReview.content.sections });
            } else {
              // Ensure content is wrapped in a sections object
              setContent({ sections: savedReview.content });
            }
            setLoading(false);
            return;
          }

          // If no saved content, generate new content
          // Extract the language from the topic object
          const topicObj = topics[0];

          // Make sure we have a valid topic string
          const topicName =
            typeof topicObj.topic === "string"
              ? topicObj.topic
              : typeof topicObj.topic === "object"
              ? JSON.stringify(topicObj.topic)
              : "Unknown Topic";

          // Extract other properties safely
          const contentLanguage = topicObj.language || "en"; // Get the language from the flashcard set, default to English
          const setId = topicObj.setId || null; // Get the setId from the topic object

          // Try to fetch additional metadata about the flashcard set if we have a setId
          let flashcardTags = [];
          if (setId) {
            try {
              const flashcardSetRef = doc(
                db,
                "users",
                user.id,
                "flashcardSets",
                setId
              );
              const flashcardSetSnap = await getDoc(flashcardSetRef);

              if (flashcardSetSnap.exists()) {
                const flashcardSetData = flashcardSetSnap.data();
                if (
                  flashcardSetData.tags &&
                  Array.isArray(flashcardSetData.tags)
                ) {
                  flashcardTags = flashcardSetData.tags;
                  // Store tags in the topic object to be used later when saving
                  topicObj.tags = flashcardSetData.tags;
                }
              }
            } catch (error) {
              console.error("Error fetching flashcard set data:", error);
            }
          }

          const response = await fetch("/api/generate-review-content", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": user.id, // Include user ID for server-side logging
            },
            body: JSON.stringify({
              topic: topicName,
              language: contentLanguage, // Include the language parameter
              setId: setId, // Include the setId parameter
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setContent(data);
        } else {
          // This was supposed to be opened from View Full Page but no content was found
          setError(
            "No content available. Please go back to the dashboard and try again."
          );
        }
      } catch (error) {
        console.error("Error loading review content:", error);
        setError(error.message || "Failed to load review content");
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Only run this when searchParams, user, or loadContent changes
  useEffect(() => {
    const topicsParam = searchParams.get("topics");
    if (!topicsParam) {
      setError("No topic parameter provided");
      setLoading(false);
      return;
    }

    try {
      // Check if reviewId is present - if so, clear sessionStorage to prevent using cached content
      const reviewId = searchParams.get("reviewId");
      if (reviewId) {
        try {
          sessionStorage.removeItem("currentReviewContent");
        } catch (error) {
          console.error("Error clearing sessionStorage:", error);
        }
      }

      const topics = JSON.parse(decodeURIComponent(topicsParam));

      // Additional validation and clean-up of topic objects
      if (!Array.isArray(topics) || topics.length === 0) {
        setError("Invalid topic format: not an array or empty array");
        setLoading(false);
        return;
      }

      // Make sure first topic has the expected topic property
      const firstTopic = topics[0];
      if (!firstTopic || typeof firstTopic !== "object" || !firstTopic.topic) {
        setError("Invalid topic format: missing required 'topic' property");
        setLoading(false);
        return;
      }

      if (user) {
        // The loadContent function will now handle checking sessionStorage first
        loadContent(topics);
      } else {
        setError("Please sign in to view study guides");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error parsing topics:", error);
      setError("Invalid topic parameter");
      setLoading(false);
    }
  }, [searchParams, user, loadContent]);

  const handleSaveReview = async () => {
    if (!user || !content) return;

    try {
      setSaving(true);
      const reviewsRef = collection(db, "users", user.id, "savedReviews");
      const reviewDoc = doc(reviewsRef);

      const topicsParam = searchParams.get("topics");
      const topics = topicsParam
        ? JSON.parse(decodeURIComponent(topicsParam))
        : [];

      // Extract topic metadata for saving
      const topicsData = topics.map((t) => {
        if (typeof t === "string") {
          return t;
        } else {
          // Extract only the necessary properties
          return {
            topic: t.topic,
            // Include these only if they exist
            ...(t.language && { language: t.language }),
            ...(t.setId && { setId: t.setId }),
            ...(t.tags && Array.isArray(t.tags) && { tags: t.tags }),
            ...(t.accuracy !== undefined && { accuracy: t.accuracy }),
            ...(t.correctAnswers !== undefined && {
              correctAnswers: t.correctAnswers,
            }),
            ...(t.totalQuestions !== undefined && {
              totalQuestions: t.totalQuestions,
            }),
            ...(t.name !== undefined && { name: t.name }),
          };
        }
      });

      // Ensure we're storing content in the correct structure
      // It might be coming directly as sections or nested in a sections property
      const contentToSave = content.sections ? content.sections : content;

      await setDoc(reviewDoc, {
        content: contentToSave,
        topics: topicsData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSnackbar({
        open: true,
        message: t("messages.saved", "Study guide saved successfully!"),
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving study guide:", error);
      setSnackbar({
        open: true,
        message: t(
          "messages.error",
          "Failed to save study guide. Please try again."
        ),
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
              }}
            >
              {t("titles.studyGuide", "Study Guide")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              {t(
                "studyGuide.comprehensive",
                "Comprehensive review materials to help you master these topics"
              )}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveReview}
            disabled={saving || !user}
            sx={{
              background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
              boxShadow: "0 3px 5px 2px rgba(63, 81, 181, .3)",
              color: "white",
              width: { xs: "100%", sm: "auto" },
              height: { xs: 48, sm: 40 },
              fontSize: { xs: "1rem", sm: "0.875rem" },
              "&:hover": {
                background: "linear-gradient(45deg, #303f9f 30%, #5c6bc0 90%)",
              },
            }}
          >
            {saving
              ? t("messages.loading", "Saving...")
              : t("buttons.save", "SAVE STUDY GUIDE")}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            🧪{" "}
            {t(
              "messages.betaFeature",
              "This feature is in beta. The content generation is experimental and may not always produce perfect results."
            )}
          </Typography>
        </Alert>

        <Stack spacing={3}>
          <NotesSection content={content?.sections?.detailedNotes} />
          <ExplanationsSection content={content?.sections?.explanations} />
          <ResourcesSection
            resources={content?.sections?.studyResources}
            type="academic"
          />
          <ResourcesSection
            resources={content?.sections?.videoContent}
            type="video"
          />
          <PracticeSection content={content?.sections?.practiceContent} />
        </Stack>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </motion.div>
    </Container>
  );
}
