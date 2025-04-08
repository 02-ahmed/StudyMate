"use client";

import { useState, useEffect, useCallback } from "react";
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
  Fade,
  Grow,
  Paper,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../utils/firebase";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

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
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [savingResults, setSavingResults] = useState(false);

  // Add navigation warning when quiz is in progress
  useEffect(() => {
    const isQuizInProgress = questions.length > 0 && !showResults;

    // Handle browser back/forward/refresh
    const handleBeforeUnload = (e) => {
      if (isQuizInProgress) {
        e.preventDefault();
        e.returnValue = ""; // Required for Chrome
        return ""; // Required for other browsers
      }
    };

    // Add event listener for browser actions
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [questions.length, showResults]);

  const handleNavigation = useCallback(
    (e) => {
      if (questions.length > 0 && !showResults) {
        const wantsToLeave = window.confirm(
          "Are you sure you want to leave? Your progress will be lost."
        );
        if (!wantsToLeave) {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          return true;
        }
      }
      return false;
    },
    [questions.length, showResults]
  );

  // Add click handler to navigation elements
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest("a");
      if (target && !target.href.includes(`/practice/${params.id}`)) {
        handleNavigation(e);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [questions.length, showResults, params.id, handleNavigation]);

  // Add back button handler
  useEffect(() => {
    const handlePopState = (e) => {
      if (handleNavigation(e)) {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [questions.length, showResults, handleNavigation]);

  // Add handler for Next.js navigation
  useEffect(() => {
    const handleBeforeNavigate = (e) => {
      if (questions.length > 0 && !showResults) {
        const wantsToLeave = window.confirm(
          "Are you sure you want to leave? Your progress will be lost."
        );
        if (!wantsToLeave) {
          e.preventDefault();
          e.stopPropagation();
          router.events?.emit?.("routeChangeError");
          throw "Navigation cancelled";
        }
      }
    };

    // Add event listener for link clicks
    const links = document.querySelectorAll("a");
    links.forEach((link) => {
      if (!link.href.includes(`/practice/${params.id}`)) {
        link.addEventListener("click", handleBeforeNavigate);
      }
    });

    return () => {
      links.forEach((link) => {
        if (!link.href.includes(`/practice/${params.id}`)) {
          link.removeEventListener("click", handleBeforeNavigate);
        }
      });
    };
  }, [questions.length, showResults, params.id, router]);

  // Modify the "Back to Practice" button click handler
  const handleBackToPractice = (e) => {
    if (handleNavigation(e)) {
      return;
    }
    router.push("/practice");
  };

  const generateAIQuestions = useCallback(async (flashcards, config) => {
    try {
      setGeneratingQuestions(true);
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flashcards,
          numQuestions: config.numQuestions,
          questionTypes: config.questionTypes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error("Error generating AI questions:", error);
      throw error;
    } finally {
      setGeneratingQuestions(false);
    }
  }, []);

  const loadTest = useCallback(async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

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

        const questionTypes = Array.isArray(config.questionTypes)
          ? config.questionTypes
          : [config.questionTypes];

        const aiQuestions = await generateAIQuestions(data.flashcards, {
          ...config,
          questionTypes,
        });

        const filteredQuestions = aiQuestions.filter((q) =>
          questionTypes.includes(q.type)
        );

        setQuestions(filteredQuestions);
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
  }, [params.id, user, searchParams, generateAIQuestions]);

  // Load saved state from localStorage on initial mount
  useEffect(() => {
    if (!user) {
      return;
    }

    // Always clear any existing saved state to ensure fresh test
    localStorage.removeItem(`practice_test_${params.id}`);
    loadTest();
  }, [user, params.id, loadTest]);

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
      setSavingResults(true);
      if (!startTime) {
        console.error("Start time not set");
        return;
      }

      // Get flashcard set data to include tags
      const setRef = doc(db, "users", user.id, "flashcardSets", params.id);
      const setSnap = await getDoc(setRef);
      const setData = setSnap.exists() ? setSnap.data() : null;
      const tags = setData?.tags || [];
      const setName = setData?.name || "Untitled Set";

      const endTime = new Date();
      const timeSpent = Math.max(1, Math.round((endTime - startTime) / 1000));

      // Check if user has already taken a test today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const testResultsRef = collection(db, "users", user.id, "testResults");
      const todayQuery = query(
        testResultsRef,
        where("dateTaken", ">=", today),
        where("dateTaken", "<", tomorrow)
      );
      const todayResults = await getDocs(todayQuery);

      // Only count as a new day if no tests were taken today
      const isNewDay = todayResults.empty;

      const testResults = {
        userId: user.id,
        flashcardSetId: params.id,
        setName: setName,
        dateTaken: serverTimestamp(),
        score: score,
        timeSpentSeconds: timeSpent,
        totalQuestions: questions.length,
        correctAnswers: Math.round((score * questions.length) / 100),
        tags: tags,
        type: "practice_test",
        isNewDay: isNewDay,
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

      await addDoc(testResultsRef, testResults);
    } catch (error) {
      console.error("Error saving test results:", error);
    } finally {
      setSavingResults(false);
    }
  };

  // Add a function to handle starting over
  const handleStartOver = () => {
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setStartTime(new Date()); // Reset start time when starting over
    loadTest();
  };

  if (loading || generatingQuestions) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography>
            {generatingQuestions
              ? "Generating practice questions..."
              : "Loading..."}
          </Typography>
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
        <Grow in={true}>
          <Card
            sx={{
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                background: `linear-gradient(90deg, #3f51b5 ${score}%, #e0e0e0 ${score}%)`,
              }}
            />
            <CardContent sx={{ p: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography
                  variant="h4"
                  gutterBottom
                  textAlign="center"
                  sx={{ color: "#3f51b5", fontWeight: "bold" }}
                >
                  Test Results
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 6,
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: 120,
                      height: 120,
                      mb: 2,
                    }}
                  >
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={120}
                      thickness={4}
                      sx={{ color: "#e0e0e0", position: "absolute" }}
                    />
                    <CircularProgress
                      variant="determinate"
                      value={score}
                      size={120}
                      thickness={4}
                      sx={{
                        color:
                          score >= 70
                            ? "#4caf50"
                            : score >= 50
                            ? "#ff9800"
                            : "#f44336",
                        position: "absolute",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {score.toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    {score >= 70
                      ? "Excellent!"
                      : score >= 50
                      ? "Good effort!"
                      : "Keep practicing!"}
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: "medium" }}
                  >
                    Question Review:
                  </Typography>
                  <Stack spacing={3}>
                    {questions.map((question, index) => {
                      const isCorrect =
                        question.type === "trueFalse"
                          ? answers[index] === question.correctAnswer
                          : question.type === "fillInBlank"
                          ? answers[index]?.toLowerCase().trim() ===
                            question.correctAnswer.toLowerCase().trim()
                          : answers[index] === question.correctAnswer;

                      return (
                        <Paper
                          key={index}
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: isCorrect ? "#4caf50" : "#f44336",
                            backgroundColor: isCorrect
                              ? "rgba(76, 175, 80, 0.04)"
                              : "rgba(244, 67, 54, 0.04)",
                          }}
                        >
                          <Stack spacing={1}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {isCorrect ? (
                                <CheckCircleOutlineIcon color="success" />
                              ) : (
                                <ErrorOutlineIcon color="error" />
                              )}
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: "medium" }}
                              >
                                Question {index + 1}
                              </Typography>
                            </Box>
                            <Typography>{question.question}</Typography>
                            <Typography color="text.secondary">
                              Your answer:{" "}
                              {answers[index]?.toString() || "Not answered"}
                            </Typography>
                            <Typography
                              sx={{
                                color: isCorrect
                                  ? "success.main"
                                  : "error.main",
                              }}
                            >
                              Correct answer:{" "}
                              {question.correctAnswer.toString()}
                            </Typography>
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                </Box>

                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="outlined"
                    onClick={handleBackToPractice}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateX(-4px)",
                      },
                    }}
                  >
                    Back to Practice
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleStartOver}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                    disabled={savingResults}
                  >
                    Retry Test
                  </Button>
                </Stack>
              </motion.div>
            </CardContent>
          </Card>
        </Grow>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Container
      maxWidth="md"
      sx={{
        height: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center", // Center vertically
        justifyContent: "center", // Center horizontally
        pt: 2,
        pb: 3,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "600px", // Limit the width for better readability
        }}
      >
        {/* Progress and Question Count */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <Box
            sx={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}
          >
            <CircularProgress
              variant="determinate"
              value={progress}
              size={32}
              thickness={4}
              sx={{ color: "#e0e0e0", position: "absolute" }}
            />
            <CircularProgress
              variant="determinate"
              value={progress}
              size={32}
              thickness={4}
              sx={{ color: "#3f51b5", position: "absolute" }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontSize: "0.7rem", fontWeight: "bold" }}
              >
                {Math.round(progress)}%
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Typography>
        </Box>

        {/* Question Card */}
        <Card
          sx={{
            mb: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, wordBreak: "break-word" }}
                >
                  {currentQuestion.question}
                </Typography>

                {currentQuestion.type === "multipleChoice" && (
                  <FormControl component="fieldset" sx={{ width: "100%" }}>
                    <RadioGroup
                      value={answers[currentQuestionIndex] || ""}
                      onChange={(e) => handleAnswer(e.target.value)}
                    >
                      <Stack spacing={0.5} sx={{ width: "100%" }}>
                        {currentQuestion.options.map((option, index) => (
                          <Paper
                            key={index}
                            elevation={0}
                            sx={{
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor:
                                answers[currentQuestionIndex] === option
                                  ? "#3f51b5"
                                  : "#e0e0e0",
                              "&:hover": {
                                borderColor: "#3f51b5",
                                bgcolor: "rgba(63, 81, 181, 0.04)",
                              },
                              width: "100%",
                            }}
                          >
                            <FormControlLabel
                              value={option}
                              control={
                                <Radio
                                  size="small"
                                  sx={{
                                    p: 1,
                                    flexShrink: 0,
                                  }}
                                />
                              }
                              label={
                                <Box
                                  sx={{
                                    minWidth: 0,
                                    width: "100%",
                                    pr: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      wordBreak: "break-word",
                                      whiteSpace: "normal",
                                    }}
                                  >
                                    {option}
                                  </Typography>
                                </Box>
                              }
                              sx={{
                                margin: 0,
                                width: "100%",
                                py: 0.75,
                                pl: 1,
                                pr: 0,
                                "& .MuiFormControlLabel-label": {
                                  width: "100%",
                                  minWidth: 0,
                                },
                              }}
                            />
                          </Paper>
                        ))}
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                )}

                {currentQuestion.type === "trueFalse" && (
                  <FormControl component="fieldset" sx={{ width: "100%" }}>
                    <RadioGroup
                      value={answers[currentQuestionIndex]?.toString() || ""}
                      onChange={(e) => handleAnswer(e.target.value === "true")}
                    >
                      <Stack spacing={0.5} sx={{ width: "100%" }}>
                        {[
                          { value: "true", label: "True" },
                          { value: "false", label: "False" },
                        ].map((option) => (
                          <Paper
                            key={option.value}
                            elevation={0}
                            sx={{
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor:
                                answers[currentQuestionIndex]?.toString() ===
                                option.value
                                  ? "#3f51b5"
                                  : "#e0e0e0",
                              "&:hover": {
                                borderColor: "#3f51b5",
                                bgcolor: "rgba(63, 81, 181, 0.04)",
                              },
                              width: "100%",
                              overflow: "hidden",
                            }}
                          >
                            <FormControlLabel
                              value={option.value}
                              control={
                                <Radio
                                  size="small"
                                  sx={{
                                    p: 1,
                                    flexShrink: 0,
                                  }}
                                />
                              }
                              label={
                                <Box
                                  sx={{
                                    minWidth: 0,
                                    width: "100%",
                                    pr: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      wordBreak: "break-word",
                                      whiteSpace: "normal",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {option.label}
                                  </Typography>
                                </Box>
                              }
                              sx={{
                                margin: 0,
                                width: "100%",
                                py: 0.75,
                                pl: 1,
                                pr: 0,
                                "& .MuiFormControlLabel-label": {
                                  width: "100%",
                                  minWidth: 0,
                                },
                              }}
                            />
                          </Paper>
                        ))}
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                )}

                {currentQuestion.type === "fillInBlank" && (
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Type your answer"
                    value={answers[currentQuestionIndex] || ""}
                    onChange={(e) => handleAnswer(e.target.value)}
                    sx={{
                      mt: 2,
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#3f51b5",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#3f51b5",
                        },
                      },
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            startIcon={<ArrowBackIcon />}
            sx={{
              borderRadius: 1.5,
              px: 2,
              py: 0.75,
            }}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleNext}
            endIcon={<ArrowForwardIcon />}
            sx={{
              borderRadius: 1.5,
              px: 2,
              py: 0.75,
            }}
          >
            {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
