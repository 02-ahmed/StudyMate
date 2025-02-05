"use client";

import { useState, useEffect } from "react";
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
} from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ArticleIcon from "@mui/icons-material/Article";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import SaveIcon from "@mui/icons-material/Save";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../../utils/firebase";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";

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

  useEffect(() => {
    const topicsParam = searchParams.get("topics");
    if (topicsParam) {
      generateContent(JSON.parse(decodeURIComponent(topicsParam)));
    }
  }, [searchParams]);

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
        content,
        topics: topics.map((t) => t.topic),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSnackbar({
        open: true,
        message: "Review saved successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving review:", error);
      setSnackbar({
        open: true,
        message: "Failed to save review. Please try again.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const generateContent = async (topics) => {
    try {
      setLoading(true);
      setError(null);
      console.log("=== GENERATING REVIEW CONTENT ===");
      console.log("Topics:", topics);

      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const topicsString = topics.map((t) => t.topic).join(", ");

      const prompt = `
        Create a comprehensive study guide for these topics: ${topicsString}
        
        Provide a clear, well-structured response with the following sections:

        1. Detailed Notes
        Explain the core concepts, principles, and theories for each topic.
        Include:
        - Key definitions and terminology
        - Main concepts and their relationships
        - Important formulas or rules
        - Step-by-step explanations of processes
        - Examples that illustrate each concept

        2. In-Depth Explanations
        Break down complex ideas and show their practical applications:
        - Detailed explanations of challenging concepts
        - Real-world examples and applications
        - Common misconceptions and how to avoid them
        - Problem-solving strategies
        - Visual descriptions where helpful

        3. Study Resources
        Recommend specific learning materials:
        - Names of relevant textbooks and chapters
        - Online courses (Coursera, edX, Khan Academy)
        - Academic papers for deeper understanding
        - Interactive simulations or tools
        - Practice problem sources

        4. Video Content
        Suggest specific educational videos:
        - YouTube channels (with exact channel names)
        - Specific video series or playlists
        - Online lecture recordings
        - Tutorial videos
        - Educational documentaries

        5. Practice Materials
        Provide concrete study activities:
        - Practice problems with solutions
        - Self-assessment questions
        - Memory techniques and mnemonics
        - Group study activities
        - Project ideas

        Format the response clearly and avoid using asterisks or special characters for formatting.
        Use clear headings and bullet points with dashes.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean up the text and parse sections
      const cleanText = text
        .replace(/\*\*/g, "") // Remove asterisks
        .replace(/```/g, ""); // Remove code blocks

      const sections = cleanText.split(/\d\.\s+/).filter(Boolean);

      setContent({
        detailedNotes: sections[0] || "No detailed notes available.",
        explanations: sections[1] || "No explanations available.",
        studyResources: sections[2] || "No study resources available.",
        videoContent: sections[3] || "No video content available.",
        practiceContent: sections[4] || "No practice materials available.",
      });
    } catch (error) {
      console.error("Error generating review content:", error);
      setError("Failed to generate review content. Please try again.");
    } finally {
      setLoading(false);
    }
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
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                textAlign: "center",
                background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Study Guide
            </Typography>
            <Typography
              variant="body1"
              sx={{ textAlign: "center", mt: 1, color: "text.secondary" }}
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
            }}
          >
            {saving ? "Saving..." : "Save Review"}
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <SchoolIcon color="primary" />
                  <Typography variant="h5">Detailed Notes</Typography>
                </Box>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                  {content?.detailedNotes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <LightbulbIcon color="primary" />
                  <Typography variant="h5">In-Depth Explanations</Typography>
                </Box>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                  {content?.explanations}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3, height: "100%", borderRadius: 2 }}>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <ArticleIcon color="primary" />
                  <Typography variant="h5">Study Resources</Typography>
                </Box>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                  {content?.studyResources}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3, height: "100%", borderRadius: 2 }}>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <YouTubeIcon color="primary" />
                  <Typography variant="h5">Video Content</Typography>
                </Box>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                  {content?.videoContent}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <SchoolIcon color="primary" />
                  <Typography variant="h5">Practice Materials</Typography>
                </Box>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                  {content?.practiceContent}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
