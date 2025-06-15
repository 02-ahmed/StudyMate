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
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";
import useTranslation from "../../hooks/useTranslation";
import ArticleIcon from "@mui/icons-material/Article";
import YouTubeIcon from "@mui/icons-material/YouTube";

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
    if (!user || !content) return;

    try {
      setSaving(true);
      const reviewsRef = collection(db, "users", user.id, "savedReviews");
      const reviewDoc = doc(reviewsRef);

      await setDoc(reviewDoc, {
        content: content,
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
    if (!topic) {
      return;
    }

    // Store the current content in sessionStorage
    sessionStorage.setItem("currentReviewContent", JSON.stringify(content));

    // Add a flag to the topic parameter
    // Make sure we preserve the language property if it exists in the topic object
    const topicData = {
      topic: typeof topic === "string" ? topic : topic.topic || topic,
      language:
        typeof topic === "object" && topic.language
          ? topic.language
          : undefined,
      setId: typeof topic === "object" && topic.setId ? topic.setId : undefined,
      useStoredContent: true,
    };
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
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 1, sm: 2 },
          padding: { xs: 2, sm: 3 },
          background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
          color: "white",
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SchoolIcon />
          <Typography
            variant="h6"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            {t("titles.studyGuide", "Study Guide")}
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            position: "absolute",
            top: "8px",
            right: "8px",
            width: 30,
            height: 30,
            padding: 0.5,
          }}
        >
          <CloseIcon sx={{ fontSize: "1.2rem" }} />
        </IconButton>

        {!loading && user && (
          <Box
            sx={{
              position: "absolute",
              top: "8px",
              right: "48px",
              display: "flex",
              gap: 1,
              alignItems: "center",
              height: 30,
            }}
          >
            <IconButton
              onClick={handleViewFullPage}
              size="small"
              sx={{
                color: "white",
                border: "1px solid rgba(255,255,255,0.5)",
                padding: 0.5,
                width: 30,
                height: 30,
                minWidth: "unset",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
              aria-label={t("buttons.viewFullPage", "View Full Page")}
            >
              <OpenInFullIcon sx={{ fontSize: "1rem" }} />
            </IconButton>
            <IconButton
              onClick={handleSaveReview}
              disabled={saving}
              size="small"
              sx={{
                color: "white",
                border: "1px solid rgba(255,255,255,0.5)",
                padding: 0.5,
                width: 30,
                height: 30,
                minWidth: "unset",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  borderColor: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
              aria-label={t("buttons.save", "Save")}
            >
              {saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveIcon sx={{ fontSize: "1rem" }} />
              )}
            </IconButton>
          </Box>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "400px",
              textAlign: "center",
            }}
          >
            <CircularProgress sx={{ mb: 3 }} />

            <Typography variant="body1" color="textSecondary">
              {loadingMessage}
            </Typography>
          </Box>
        ) : content?.error ? (
          <Alert severity="error">
            {t(
              "studyGuide.errors.generationFailed",
              "Failed to generate study guide."
            )}{" "}
            {content.details}
          </Alert>
        ) : (
          <Stack spacing={3}>
            <Alert severity="info" icon={<span className="wave">🧪</span>}>
              {t(
                "messages.betaFeature",
                "This feature is in beta. The content generation is experimental and may not always produce perfect results."
              )}
            </Alert>
            <NotesSection content={content?.detailedNotes} />
            <ExplanationsSection content={content?.explanations} />
            <ResourcesSection
              resources={content?.studyResources}
              type="academic"
            />
            <ResourcesSection resources={content?.videoContent} type="video" />
            <PracticeSection content={content?.practiceContent} />
          </Stack>
        )}
      </DialogContent>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
