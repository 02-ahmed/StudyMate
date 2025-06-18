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
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import StarIcon from "@mui/icons-material/Star";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TranslateIcon from "@mui/icons-material/Translate";
import ImageIcon from "@mui/icons-material/Image";
import { db } from "../../../utils/firebase";
import { SUPPORTED_LANGUAGES } from "../../contexts/LanguageContext";
import { cleanFlashcardContent } from "@/utils/schemas";
import useTranslation from "../../hooks/useTranslation";
import TextToSpeech from "../../components/TextToSpeech";

export default function FlashcardsIdContent({ params }) {
  const { user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en"); // Default to English
  const [imageData, setImageData] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const router = useRouter();
  const { t } = useTranslation(); // Add translation hook

  const loadFlashcards = useCallback(async () => {
    if (!user) return;

    try {
      const docRef = doc(db, "users", user.id, "flashcardSets", params.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name);

        console.log("========== FLASHCARD SET DATA ==========");
        console.log("Flashcard set ID:", params.id);
        console.log("Flashcard set name:", data.name);
        console.log("Flashcard set complete data:", data);
        console.log(
          "Flashcard set raw data (stringified):",
          JSON.stringify(data)
        );
        console.log("Flashcard set language:", data.language);
        console.log("Flashcard set language (quoted):", `"${data.language}"`);
        console.log("Flashcard set language type:", typeof data.language);
        console.log("Is language field present?", "language" in data);
        console.log("Is language null?", data.language === null);
        console.log("Is language undefined?", data.language === undefined);
        console.log("Is language empty string?", data.language === "");
        console.log(
          "Language string length:",
          data.language ? data.language.length : 0
        );
        console.log("Supported languages:", Object.keys(SUPPORTED_LANGUAGES));
        console.log(
          "Is language supported?",
          data.language in SUPPORTED_LANGUAGES
        );
        console.log("User ID:", user.id);
        console.log(
          "Created at:",
          data.createdAt ? data.createdAt.toDate().toString() : "unknown"
        );
        console.log(
          "Number of flashcards:",
          Array.isArray(data.flashcards)
            ? data.flashcards.length
            : typeof data.flashcards === "object"
            ? Object.keys(data.flashcards).length
            : 0
        );
        console.log("========================================");

        // Set the language if available
        if (data.language && SUPPORTED_LANGUAGES[data.language]) {
          console.log("Setting language to:", data.language);
          console.log(
            "Language display name:",
            SUPPORTED_LANGUAGES[data.language]
          );
          setLanguage(data.language);
        } else {
          console.log(
            "Using default language (en) because:",
            !data.language
              ? "language is not set"
              : !SUPPORTED_LANGUAGES[data.language]
              ? "language is not supported"
              : "unknown reason"
          );
          console.log(
            "Default language display name:",
            SUPPORTED_LANGUAGES["en"]
          );
        }
        // Handle both array and object formats for backwards compatibility
        if (Array.isArray(data.flashcards)) {
          // Add canVisualize=true to all flashcards for testing
          setFlashcards(
            data.flashcards.map((card) => ({
              ...card,
              canVisualize: true, // Force all cards to be visualizable for testing
            }))
          );
        } else if (typeof data.flashcards === "object") {
          // Convert object to array if it's in the old format
          const flashcardsArray = Object.values(data.flashcards);
          // Add canVisualize=true to all flashcards for testing
          setFlashcards(
            flashcardsArray.map((card) => ({
              ...card,
              canVisualize: true, // Force all cards to be visualizable for testing
            }))
          );
        } else {
          setFlashcards([]);
        }
      } else {
        console.log("No flashcard set found with ID:", params.id);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading flashcards:", error);
      console.error("Error stack:", error.stack);
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

  // Get the current text to be displayed (and potentially spoken)
  const getCurrentText = () => {
    if (!flashcards[currentIndex]) return "";
    return isFlipped
      ? cleanFlashcardContent(flashcards[currentIndex].back)
      : cleanFlashcardContent(flashcards[currentIndex].front);
  };

  const generateImage = async (e) => {
    e.stopPropagation(); // Prevent card from flipping

    if (imageData) {
      // Toggle image visibility if already loaded
      setShowImage(!showImage);
      return;
    }

    setLoadingImage(true);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          front: flashcards[currentIndex].front,
          back: flashcards[currentIndex].back,
        }),
      });

      const data = await response.json();

      if (data.imageData) {
        setImageData(data.imageData);
        setShowImage(true);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoadingImage(false);
    }
  };

  // Reset image when changing cards
  useEffect(() => {
    setImageData(null);
    setShowImage(false);
  }, [currentIndex]);

  // Add debugging logs to help troubleshoot
  useEffect(() => {
    if (flashcards[currentIndex]) {
      console.log("Current flashcard:", flashcards[currentIndex]);
      console.log(
        "Has canVisualize property:",
        "canVisualize" in flashcards[currentIndex]
      );
      console.log("canVisualize value:", flashcards[currentIndex].canVisualize);
    }
  }, [flashcards, currentIndex]);

  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          pt: { xs: 1, sm: 1.5 },
          pb: { xs: 1, sm: 1.5 },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Container
        maxWidth="md"
        sx={{
          pt: { xs: 1, sm: 1.5 },
          pb: { xs: 1, sm: 1.5 },
        }}
      >
        <Button
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          {t("flashcards.backToNotes", "Back to Notes")}
        </Button>
        <Typography variant="h5" sx={{ textAlign: "center", mt: 4 }}>
          {t(
            "flashcards.noFlashcardsFound",
            "No flashcards found in this collection"
          )}
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        pt: { xs: 1, sm: 1.5 },
        pb: { xs: 1, sm: 1.5 },
        display: "flex",
        flexDirection: "column",
        height: "auto",
        minHeight: "auto",
        maxHeight: "100vh",
        overflow: "auto",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      {/* Top Section - Header */}
      <Box sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: { xs: 0.5, sm: 0.75 },
          }}
        >
          <Button
            onClick={handleBack}
            startIcon={<ArrowBackIcon sx={{ fontSize: "1rem" }} />}
            size="small"
            sx={{ py: 0.5, px: 1, fontSize: "0.85rem" }}
          >
            {t("flashcards.backToNotes", "Back to Notes")}
          </Button>

          {/* Language indicator */}
          <Chip
            icon={<TranslateIcon sx={{ fontSize: "0.9rem" }} />}
            label={SUPPORTED_LANGUAGES[language] || "English"}
            color="primary"
            variant="outlined"
            size="small"
            sx={{
              height: 26,
              "& .MuiChip-label": { px: 1, fontSize: "0.75rem" },
            }}
          />
        </Box>
        <Typography
          variant="h6"
          sx={{
            mb: 0.5,
            textAlign: "center",
            lineHeight: 1.2,
            fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.35rem" },
          }}
        >
          {name || t("flashcards.untitledSet", "Untitled Set")}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontSize: "0.8rem" }}
          >
            {t("flashcards.cardCount", {
              current: currentIndex + 1,
              total: flashcards.length,
            })}
          </Typography>
        </Box>
      </Box>

      {/* Card Section - Middle */}
      <Card
        onClick={handleFlip}
        sx={{
          height: { xs: "25vh", sm: "28vh", md: "32vh" },
          minHeight: "160px",
          maxHeight: "280px",
          width: "100%",
          cursor: "pointer",
          perspective: "1000px",
          backgroundColor: "transparent",
          my: 0.5,
          boxShadow: "0 1px 5px rgba(0,0,0,0.06)",
          flexGrow: 0,
          flexShrink: 1,
          display: "flex",
          position: "relative", // For positioning the TTS button
        }}
      >
        {/* Text-to-speech button using our reusable component */}
        <TextToSpeech
          text={getCurrentText()}
          language={language}
          tooltipText={
            isFlipped
              ? t("accessibility.textToSpeech.speakBack", "Speak answer")
              : t("accessibility.textToSpeech.speakFront", "Speak question")
          }
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: "50%",
          }}
        />

        {/* Image visualization button - removed conditional check for testing */}
        <Tooltip
          title={
            imageData
              ? showImage
                ? t("flashcards.hideImage", "Hide image")
                : t("flashcards.showImage", "Show image")
              : t("flashcards.generateImage", "Generate image")
          }
        >
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              generateImage(e);
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 48,
              zIndex: 10,
              backgroundColor: showImage
                ? "rgba(63, 81, 181, 0.2)"
                : "rgba(255,255,255,0.7)",
              borderRadius: "50%",
              "&:hover": {
                backgroundColor: "rgba(63, 81, 181, 0.2)",
              },
            }}
            disabled={loadingImage}
          >
            {loadingImage ? <CircularProgress size={20} /> : <ImageIcon />}
          </IconButton>
        </Tooltip>

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
          {/* Front of card */}
          <CardContent
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
              overflowY: "auto",
              padding: "14px !important",
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "2px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#bbb",
                borderRadius: "2px",
                "&:hover": {
                  background: "#999",
                },
              },
            }}
          >
            {/* Show image on front if enabled */}
            {!isFlipped && showImage && imageData && (
              <Box sx={{ mb: 2, maxWidth: "100%", textAlign: "center" }}>
                <img
                  src={`data:image/png;base64,${imageData}`}
                  alt="Flashcard visualization"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "140px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </Box>
            )}

            <Box
              sx={{
                width: "100%",
                padding: "0 14px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  width: "100%",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  fontSize: "1rem",
                  lineHeight: 1.4,
                  textAlign: "center",
                }}
              >
                {cleanFlashcardContent(flashcards[currentIndex]?.front) || ""}
              </Typography>
            </Box>
          </CardContent>

          {/* Back of card */}
          <CardContent
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
              transform: "rotateY(180deg)",
              overflowY: "auto",
              padding: "14px !important",
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "2px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#bbb",
                borderRadius: "2px",
                "&:hover": {
                  background: "#999",
                },
              },
            }}
          >
            {/* Show image on back if enabled */}
            {isFlipped && showImage && imageData && (
              <Box sx={{ mb: 2, maxWidth: "100%", textAlign: "center" }}>
                <img
                  src={`data:image/png;base64,${imageData}`}
                  alt="Flashcard visualization"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "140px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </Box>
            )}

            <Box
              sx={{
                width: "100%",
                padding: "0 14px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  width: "100%",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  fontSize: "1rem",
                  lineHeight: 1.4,
                  textAlign: "center",
                }}
              >
                {cleanFlashcardContent(flashcards[currentIndex]?.back) || ""}
              </Typography>
            </Box>
          </CardContent>
        </Box>
      </Card>

      {/* Navigation Buttons - Bottom */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mt: 0.5,
          mb: 0.5,
          flexShrink: 0,
          position: "sticky",
          bottom: 0,
          backgroundColor: "background.paper",
          zIndex: 2,
          pt: 0.5,
        }}
      >
        <Button
          variant="contained"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          startIcon={<ArrowBackIcon sx={{ fontSize: "1rem" }} />}
          size="small"
          sx={{ px: 1.5, py: 0.5, minWidth: "85px", fontSize: "0.85rem" }}
        >
          {t("buttons.previous", "Previous")}
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          endIcon={<ArrowForwardIcon sx={{ fontSize: "1rem" }} />}
          size="small"
          sx={{ px: 1.5, py: 0.5, minWidth: "85px", fontSize: "0.85rem" }}
        >
          {t("buttons.next", "Next")}
        </Button>
      </Box>
    </Container>
  );
}
