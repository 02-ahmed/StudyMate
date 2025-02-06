"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (user) {
      loadFlashcardSets();
    }
  }, [user]);

  const loadFlashcardSets = async () => {
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
  };

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
        Practice Test Generator
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
          : "Create a custom practice test from your flashcard sets"}
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
                <InputLabel>Select Flashcard Set</InputLabel>
                <Select
                  value={selectedSet}
                  onChange={(e) => setSelectedSet(e.target.value)}
                  label="Select Flashcard Set"
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
              <Typography variant="h6" gutterBottom sx={{ color: "#3f51b5" }}>
                Question Types
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={questionTypes.multipleChoice}
                      onChange={() =>
                        handleQuestionTypeChange("multipleChoice")
                      }
                    />
                  }
                  label="Multiple Choice"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={questionTypes.trueFalse}
                      onChange={() => handleQuestionTypeChange("trueFalse")}
                    />
                  }
                  label="True/False"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={questionTypes.fillInBlank}
                      onChange={() => handleQuestionTypeChange("fillInBlank")}
                    />
                  }
                  label="Fill in the Blank"
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Number of Questions</InputLabel>
                <Select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  label="Number of Questions"
                >
                  <MenuItem value={5}>5 questions</MenuItem>
                  <MenuItem value={10}>10 questions</MenuItem>
                  <MenuItem value={15}>15 questions</MenuItem>
                </Select>
                <FormHelperText>
                  Maximum 15 questions per test for optimal performance
                </FormHelperText>
              </FormControl>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleStartTest}
                disabled={
                  !selectedSet || !Object.values(questionTypes).some(Boolean)
                }
                sx={{
                  background:
                    "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
                  boxShadow: "0 3px 5px 2px rgba(63, 81, 181, .3)",
                  borderRadius: 2,
                  height: "50px",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #303f9f 30%, #5c6bc0 90%)",
                  },
                }}
              >
                Generate Practice Test
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
