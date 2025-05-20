"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  FormHelperText,
  Alert,
} from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import useTranslation from "../hooks/useTranslation";

export default function PracticeContent() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState("");
  const [questionTypes, setQuestionTypes] = useState({
    multipleChoice: true,
    trueFalse: true,
    fillInBlank: true,
  });
  const [error, setError] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const { language } = useLanguage();
  const { t } = useTranslation();

  // Handle URL parameters for pre-configuration
  useEffect(() => {
    const type = searchParams.get("type");
    const topic = searchParams.get("topic");
    const focus = searchParams.get("focus");

    // Reset question types based on recommended type
    if (type) {
      setQuestionTypes({
        multipleChoice: type === "multipleChoice",
        trueFalse: type === "trueFalse",
        fillInBlank: type === "fillInBlank",
      });
    }

    // If topic is specified, find and select the matching set
    if (topic && flashcardSets.length > 0) {
      const matchingSet = flashcardSets.find(
        (set) => set.tags && set.tags.includes(topic)
      );
      if (matchingSet) {
        setSelectedSet(matchingSet.id);
      }
    }

    // If focusing on missed questions, adjust the configuration
    if (focus === "missed") {
      setNumQuestions(5); // Start with fewer questions for focused practice
    }
  }, [searchParams, flashcardSets]);

  const loadFlashcardSets = useCallback(async () => {
    if (!user) return;

    try {
      const setsRef = collection(db, "users", user.id, "flashcardSets");
      const snapshot = await getDocs(setsRef);

      const sets = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.flashcards && data.flashcards.length > 0) {
          sets.push({
            id: doc.id,
            name: data.name || "Untitled Set",
            cardCount: data.flashcards.length,
            tags: data.tags || [],
          });
        }
      });

      setFlashcardSets(sets);
      setLoading(false);
    } catch (error) {
      console.error("Error loading flashcard sets:", error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFlashcardSets();
    }
  }, [user, loadFlashcardSets]);

  const handleQuestionTypeChange = (type) => {
    setQuestionTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleStartTest = async () => {
    if (!selectedSet) return;

    try {
      setError(null);
      // Store test configuration and navigate to test page
      const config = {
        setId: selectedSet,
        questionTypes: Object.entries(questionTypes)
          .filter(([_, enabled]) => enabled)
          .map(([type]) => type),
        numQuestions,
        focus: searchParams.get("focus"), // Pass through the focus parameter
      };

      router.push(`/practice/${selectedSet}?config=${JSON.stringify(config)}`);
    } catch (error) {
      setError("Failed to start test. Please try again.");
      console.error("Error starting test:", error);
    }
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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          textAlign: "center",
          background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: "bold",
        }}
      >
        {t("practiceTestGenerator")}
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 4, textAlign: "center", color: "text.secondary" }}
      >
        {searchParams.get("type")
          ? `Focusing on ${searchParams
              .get("type")
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()} questions`
          : searchParams.get("topic")
          ? `Practicing ${searchParams.get("topic")}`
          : t("createCustomTest")}
      </Typography>

      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(63, 81, 181, 0.15)",
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
        }}
      >
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t("selectFlashcardSet")}</InputLabel>
                <Select
                  value={selectedSet}
                  onChange={(e) => setSelectedSet(e.target.value)}
                  label={t("selectFlashcardSet")}
                >
                  {flashcardSets.map((set) => (
                    <MenuItem key={set.id} value={set.id}>
                      {set.name} ({set.cardCount} cards)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                {t("questionTypes")}
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={questionTypes.multipleChoice}
                      onChange={() =>
                        handleQuestionTypeChange("multipleChoice")
                      }
                      color="primary"
                    />
                  }
                  label={t("multipleChoice")}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={questionTypes.trueFalse}
                      onChange={() => handleQuestionTypeChange("trueFalse")}
                      color="primary"
                    />
                  }
                  label={t("trueFalse")}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={questionTypes.fillInBlank}
                      onChange={() => handleQuestionTypeChange("fillInBlank")}
                      color="primary"
                    />
                  }
                  label={t("fillInBlank")}
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                {t("numberOfQuestions")}
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                >
                  {[5, 10, 15].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{t("maxQuestionsNote")}</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        onClick={handleStartTest}
        disabled={!selectedSet || !Object.values(questionTypes).some(Boolean)}
        sx={{
          py: 1.5,
          borderRadius: 2,
          fontSize: "1rem",
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(63, 81, 181, 0.2)",
          background: "linear-gradient(45deg, #3f51b5 30%, #5a67d8 90%)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 6px 15px rgba(63, 81, 181, 0.3)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {t("generatePracticeTest")}
      </Button>
    </Container>
  );
}
