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
} from "firebase/firestore";

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

  const loadContent = useCallback(
    async (topics) => {
      try {
        setLoading(true);
        setError(null);

        // First try to find saved content
        const reviewsRef = collection(db, "users", user.id, "savedReviews");
        // Query for both old and new data structures
        const queries = [
          query(reviewsRef, where("topics", "array-contains", topics[0].topic)),
          query(reviewsRef, where("topic", "==", topics[0].topic)),
        ];

        let savedReview = null;
        for (const q of queries) {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            // Use the most recently saved review
            savedReview = querySnapshot.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .sort((a, b) => b.updatedAt - a.updatedAt)[0];
            break;
          }
        }

        if (savedReview) {
          setContent({ sections: savedReview.content });
          setLoading(false);
          return;
        }

        // If no saved content, generate new content
        const response = await fetch("/api/generate-review-content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: topics[0].topic,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error("Error loading review content:", error);
        setError(error.message || "Failed to load review content");
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    const topicsParam = searchParams.get("topics");
    if (!topicsParam) {
      setError("No topic parameter provided");
      setLoading(false);
      return;
    }

    try {
      const topics = JSON.parse(decodeURIComponent(topicsParam));
      if (!topics?.[0]?.topic) {
        setError("Invalid topic format");
        setLoading(false);
        return;
      }

      if (user) {
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

      await setDoc(reviewDoc, {
        content: content.sections,
        topics: topics.map((t) => t.topic),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSnackbar({
        open: true,
        message: "Study guide saved successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving study guide:", error);
      setSnackbar({
        open: true,
        message: "Failed to save study guide. Please try again.",
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
              Study Guide
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Comprehensive review materials to help you master these topics
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
            {saving ? "Saving..." : "SAVE STUDY GUIDE"}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            🧪 This feature is in beta. The content generation is experimental
            and may not always produce perfect results.
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
