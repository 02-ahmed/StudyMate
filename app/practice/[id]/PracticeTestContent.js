"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  LinearProgress,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../utils/firebase";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function generateQuestions(flashcards, config) {
  const { questionTypes, numQuestions } = config;
  const questions = [];
  const usedIndices = new Set();

  // Helper function to get random flashcards for multiple choice options
  const getRandomOptions = (correctAnswer, count) => {
    const options = [correctAnswer];
    const availableCards = flashcards.filter(
      (card) => card.back !== correctAnswer
    );

    while (options.length < count && availableCards.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      options.push(availableCards[randomIndex].back);
      availableCards.splice(randomIndex, 1);
    }

    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  };

  while (
    questions.length < numQuestions &&
    usedIndices.size < flashcards.length
  ) {
    let index;
    do {
      index = Math.floor(Math.random() * flashcards.length);
    } while (usedIndices.has(index));

    usedIndices.add(index);
    const card = flashcards[index];
    const typeIndex = Math.floor(Math.random() * questionTypes.length);
    const questionType = questionTypes[typeIndex];

    switch (questionType) {
      case "multipleChoice": {
        const options = getRandomOptions(card.back, 4);
        questions.push({
          type: "multipleChoice",
          question: card.front,
          options,
          correctAnswer: card.back,
        });
        break;
      }
      case "trueFalse": {
        const isTrue = Math.random() < 0.5;
        const answer = isTrue
          ? card.back
          : flashcards[(index + 1) % flashcards.length].back;
        questions.push({
          type: "trueFalse",
          question: `${card.front}\nAnswer: ${answer}`,
          correctAnswer: isTrue,
        });
        break;
      }
      case "fillInBlank": {
        questions.push({
          type: "fillInBlank",
          question: card.front,
          correctAnswer: card.back,
        });
        break;
      }
    }
  }

  return questions.sort(() => Math.random() - 0.5);
}

export default function PracticeTestContent({ params }) {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    if (user) {
      loadTest();
    }
  }, [user]);

  const loadTest = async () => {
    try {
      const config = JSON.parse(searchParams.get("config"));
      const docRef = doc(db, "users", user.id, "flashcardSets", params.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data.flashcards || data.flashcards.length === 0) {
          setError("No flashcards found in this set");
          setLoading(false);
          return;
        }

        const generatedQuestions = generateQuestions(data.flashcards, config);
        setQuestions(generatedQuestions);
        setStartTime(new Date());
      } else {
        setError("Flashcard set not found");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading test:", error);
      setError("Error loading test");
      setLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const finalScore = calculateScore();
      saveTestResults(finalScore);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (question.type === "trueFalse") {
        if (userAnswer === question.correctAnswer) correct++;
      } else if (question.type === "fillInBlank") {
        if (
          userAnswer?.toLowerCase().trim() ===
          question.correctAnswer.toLowerCase().trim()
        ) {
          correct++;
        }
      } else {
        if (userAnswer === question.correctAnswer) correct++;
      }
    });
    return (correct / questions.length) * 100;
  };

  const saveTestResults = async (score) => {
    try {
      if (!startTime) {
        console.error("Start time not set");
        return;
      }

      const endTime = new Date();
      const timeSpent = Math.max(1, Math.round((endTime - startTime) / 1000)); // ensure at least 1 second

      console.log("Test time:", {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        timeSpent,
      });

      const testResults = {
        userId: user.id,
        flashcardSetId: params.id,
        dateTaken: serverTimestamp(),
        score: score,
        timeSpentSeconds: timeSpent,
        totalQuestions: questions.length,
        correctAnswers: Math.round((score * questions.length) / 100),
        questionDetails: questions.map((question, index) => ({
          type: question.type,
          question: question.question,
          correctAnswer: question.correctAnswer,
          userAnswer: answers[index],
          isCorrect:
            question.type === "trueFalse"
              ? answers[index] === question.correctAnswer
              : question.type === "fillInBlank"
              ? answers[index]?.toLowerCase().trim() ===
                question.correctAnswer.toLowerCase().trim()
              : answers[index] === question.correctAnswer,
        })),
      };

      const testResultsRef = collection(db, "users", user.id, "testResults");
      await addDoc(testResultsRef, testResults);
    } catch (error) {
      console.error("Error saving test results:", error);
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

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => router.push("/practice")}
          startIcon={<ArrowBackIcon />}
        >
          Back to Practice
        </Button>
      </Container>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom textAlign="center">
              Test Results
            </Typography>
            <Typography
              variant="h2"
              textAlign="center"
              color="primary"
              sx={{ mb: 4 }}
            >
              {score.toFixed(1)}%
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Question Review:
              </Typography>
              {questions.map((question, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Question {index + 1}: {question.question}
                  </Typography>
                  <Typography color="text.secondary">
                    Your answer: {answers[index]?.toString() || "Not answered"}
                  </Typography>
                  <Typography color="primary">
                    Correct answer: {question.correctAnswer.toString()}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                onClick={() => router.push("/practice")}
                startIcon={<ArrowBackIcon />}
              >
                Back to Practice
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                }}
              >
                Retry Test
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <LinearProgress variant="determinate" value={progress} sx={{ mb: 4 }} />

      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Question {currentQuestionIndex + 1} of {questions.length}
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {currentQuestion.question}
          </Typography>

          {currentQuestion.type === "multipleChoice" && (
            <FormControl component="fieldset">
              <RadioGroup
                value={answers[currentQuestionIndex] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {currentQuestion.type === "trueFalse" && (
            <FormControl component="fieldset">
              <RadioGroup
                value={
                  answers[currentQuestionIndex] === undefined
                    ? ""
                    : answers[currentQuestionIndex]
                }
                onChange={(e) => handleAnswer(e.target.value === "true")}
              >
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="True"
                />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="False"
                />
              </RadioGroup>
            </FormControl>
          )}

          {currentQuestion.type === "fillInBlank" && (
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your answer"
              value={answers[currentQuestionIndex] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="contained"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          startIcon={<ArrowBackIcon />}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          endIcon={<ArrowForwardIcon />}
        >
          {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </Container>
  );
}
