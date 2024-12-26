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
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useRouter } from "next/navigation";

export default function PracticeContent() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState("");
  const [questionTypes, setQuestionTypes] = useState({
    multipleChoice: true,
    trueFalse: true,
    fillInBlank: true,
  });
  const [numQuestions, setNumQuestions] = useState(10);

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

  const handleStartTest = () => {
    if (!selectedSet) return;

    // Store test configuration and navigate to test page
    const config = {
      setId: selectedSet,
      questionTypes: Object.entries(questionTypes)
        .filter(([_, enabled]) => enabled)
        .map(([type]) => type),
      numQuestions,
    };

    router.push(`/practice/${selectedSet}?config=${JSON.stringify(config)}`);
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
        sx={{ textAlign: "center" }}
      >
        Practice Test Generator
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, textAlign: "center" }}>
        Create a custom practice test from your flashcard sets
      </Typography>

      <Card sx={{ mb: 4 }}>
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
              <Typography variant="h6" gutterBottom>
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
                  <MenuItem value={20}>20 questions</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleStartTest}
                disabled={
                  !selectedSet || !Object.values(questionTypes).some(Boolean)
                }
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
