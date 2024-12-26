"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
  Rating,
  CircularProgress,
} from "@mui/material";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import StarIcon from "@mui/icons-material/Star";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { db } from "../../../utils/firebase";

export default function FlashcardsIdContent({ params }) {
  const { user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const router = useRouter();

  const loadFlashcards = useCallback(async () => {
    if (!user) return;

    try {
      const docRef = doc(db, "users", user.id, "flashcardSets", params.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name);
        // Handle both array and object formats for backwards compatibility
        if (Array.isArray(data.flashcards)) {
          setFlashcards(data.flashcards);
        } else if (typeof data.flashcards === "object") {
          // Convert object to array if it's in the old format
          const flashcardsArray = Object.values(data.flashcards);
          setFlashcards(flashcardsArray);
        } else {
          setFlashcards([]);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading flashcards:", error);
      setLoading(false);
    }
  }, [user, params.id]);

  useEffect(() => {
    if (user) {
      loadFlashcards();
    }
  }, [user, loadFlashcards]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleBack = () => {
    router.push("/notes");
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Notes
        </Button>
        <Typography variant="h5" sx={{ textAlign: "center", mt: 4 }}>
          No flashcards found in this collection
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button onClick={handleBack} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Back to Notes
      </Button>

      <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
        {name || "Untitled Set"}
      </Typography>

      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography variant="subtitle1">
          Card {currentIndex + 1} of {flashcards.length}
        </Typography>
      </Box>

      <Card
        onClick={handleFlip}
        sx={{
          height: 400,
          width: "100%",
          cursor: "pointer",
          perspective: "1000px",
          backgroundColor: "transparent",
          mb: 3,
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            transition: "transform 0.6s",
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <CardContent
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
              overflowY: "auto",
              padding: "24px !important",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#888",
                borderRadius: "4px",
                "&:hover": {
                  background: "#666",
                },
              },
            }}
          >
            <Box
              sx={{
                width: "100%",
                padding: "0 24px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  width: "100%",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  fontSize: "1.1rem",
                  lineHeight: 1.6,
                  textAlign: "center",
                }}
              >
                {flashcards[currentIndex]?.front || ""}
              </Typography>
            </Box>
          </CardContent>

          <CardContent
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
              transform: "rotateY(180deg)",
              overflowY: "auto",
              padding: "24px !important",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#888",
                borderRadius: "4px",
                "&:hover": {
                  background: "#666",
                },
              },
            }}
          >
            <Box
              sx={{
                width: "100%",
                padding: "0 24px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  width: "100%",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  fontSize: "1.1rem",
                  lineHeight: 1.6,
                  textAlign: "center",
                }}
              >
                {flashcards[currentIndex]?.back || ""}
              </Typography>
            </Box>
          </CardContent>
        </Box>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          variant="contained"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          startIcon={<ArrowBackIcon />}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          endIcon={<ArrowForwardIcon />}
        >
          Next
        </Button>
      </Box>
    </Container>
  );
}
