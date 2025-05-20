"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  CircularProgress,
  Stack,
  Typography,
  Alert,
  Button,
  Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import NotesSection from "./NotesSection";
import ExplanationsSection from "./ExplanationsSection";
import ResourcesSection from "./ResourcesSection";
import PracticeSection from "./PracticeSection";
import { useUser } from "@clerk/nextjs";
import { db } from "../../../utils/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import SaveIcon from "@mui/icons-material/Save";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";
import useTranslation from "../../hooks/useTranslation";

export default function ReviewDialog({
  open,
  onClose,
  content,
  loading,
  topic,
}) {
  const { user } = useUser();
  const router = useRouter();
  const { t } = useTranslation();

  // Create stable loading messages with useMemo
  const loadingMessages = useMemo(
    () => [
      t(
        "studyGuide.loadingMessages.analyzing",
        "Analyzing topic and generating comprehensive notes..."
      ),
      t(
        "studyGuide.loadingMessages.creating",
        "Creating detailed explanations and examples..."
      ),
      t(
        "studyGuide.loadingMessages.finding",
        "Finding relevant study resources and videos..."
      ),
      t(
        "studyGuide.loadingMessages.preparing",
        "Preparing practice materials..."
      ),
      t(
        "studyGuide.loadingMessages.finishing",
        "Almost there! Putting everything together..."
      ),
    ],
    [t]
  );

  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Only run this effect when loading state changes
  useEffect(() => {
    // Don't do anything if not loading
    if (!loading) return;

    // Use a stable reference to the messages that won't change
    const messages = loadingMessages;

    // Set the first message
    setLoadingMessage(messages[0]);

    // Keep a reference to the index outside of the interval
    let messageIndex = 0;

    // Set up the rotation interval
    const timer = setInterval(() => {
      // Update the index and wrap around when we reach the end
      messageIndex = (messageIndex + 1) % messages.length;
      // Set the new message
      setLoadingMessage(messages[messageIndex]);
    }, 3000);

    // Clean up the interval when the component unmounts or loading changes
    return () => clearInterval(timer);
  }, [loading]); // Remove loadingMessages dependency to avoid rerenders

  const handleSaveReview = async () => {
    if (!user || !content?.sections) return;

    try {
      setSaving(true);
      const reviewsRef = collection(db, "users", user.id, "savedReviews");
      const reviewDoc = doc(reviewsRef);

      await setDoc(reviewDoc, {
        content: content.sections,
        topics: [topic],
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

  const handleViewFullPage = () => {
    if (!topic || !content) {
      setSnackbar({
        open: true,
        message: "Cannot view full page: content is not ready",
        severity: "error",
      });
      return;
    }

    // Store the current content in sessionStorage
    sessionStorage.setItem("currentReviewContent", JSON.stringify(content));

    // Add a flag to the topic parameter
    const topicData = { topic, useStoredContent: true };
    const topicParam = encodeURIComponent(JSON.stringify([topicData]));

    // Navigate to full page
    router.push(`/review?topics=${topicParam}`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
          color: "white",
        }}
      >
        <SchoolIcon />
        {t("titles.studyGuide", "Study Guide")}
        <Box sx={{ flexGrow: 1 }} />
        {!loading && user && (
          <>
            <Button onClick={handleViewFullPage} sx={{ color: "white", mr: 1 }}>
              {t("buttons.viewFullPage", "View Full Page")}
            </Button>
            <Button
              startIcon={<SaveIcon />}
              onClick={handleSaveReview}
              disabled={saving}
              sx={{ color: "white" }}
            >
              {saving
                ? t("messages.loading", "Saving...")
                : t("buttons.save", "Save")}
            </Button>
          </>
        )}
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            🧪{" "}
            {t(
              "messages.betaFeature",
              "This feature is in beta. The content generation is experimental and may not always produce perfect results."
            )}
          </Typography>
        </Alert>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              my: 4,
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography variant="body1" color="text.secondary" align="center">
              {loadingMessage}
            </Typography>
          </Box>
        ) : (
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
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </DialogContent>
    </Dialog>
  );
}
