"use client";

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
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "../../../utils/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import SaveIcon from "@mui/icons-material/Save";
import { useRouter } from "next/navigation";

const loadingMessages = [
  "Analyzing topic and generating comprehensive notes...",
  "Creating detailed explanations and examples...",
  "Finding relevant study resources and videos...",
  "Preparing practice materials...",
  "Almost there! Putting everything together...",
];

export default function ReviewDialog({
  open,
  onClose,
  content,
  loading,
  topic,
}) {
  const { user } = useUser();
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (loading) {
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[index]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loading]);

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

  const handleViewFullPage = () => {
    if (!topic) {
      console.error("No topic provided");
      setSnackbar({
        open: true,
        message: "Cannot view full page: topic is missing",
        severity: "error",
      });
      return;
    }
    const topicParam = encodeURIComponent(JSON.stringify([{ topic }]));
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
        Study Guide
        <Box sx={{ flexGrow: 1 }} />
        {!loading && user && (
          <>
            <Button onClick={handleViewFullPage} sx={{ color: "white", mr: 1 }}>
              View Full Page
            </Button>
            <Button
              startIcon={<SaveIcon />}
              onClick={handleSaveReview}
              disabled={saving}
              sx={{ color: "white" }}
            >
              {saving ? "Saving..." : "Save"}
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
            🧪 This feature is in beta. The content generation is experimental
            and may not always produce perfect results.
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
