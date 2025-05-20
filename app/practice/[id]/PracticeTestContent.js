"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  Chip,
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
import TranslateIcon from "@mui/icons-material/Translate";
import {
  createTestResult,
  cleanFlashcardContent,
} from "../../../utils/schemas";
import { SUPPORTED_LANGUAGES } from "../../contexts/LanguageContext";
import useTranslation from "../../hooks/useTranslation";

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
  const [loadingMessage, setLoadingMessage] = useState("");
  const [savingResults, setSavingResults] = useState(false);
  const [setName, setSetName] = useState("");
  const [language, setLanguage] = useState("en"); // Default to English
  const { t } = useTranslation(); // Add translation hook

  // Define loading messages with translations
  const loadingMessages = useMemo(
    () => [
      t("practice.loadingMessages.analyzing", "Analyzing your flashcards..."),
      t(
        "practice.loadingMessages.creating",
        "Creating challenging practice questions..."
      ),
      t(
        "practice.loadingMessages.varying",
        "Varying question types and difficulty levels..."
      ),
      t(
        "practice.loadingMessages.personalizing",
        "Personalizing your practice test..."
      ),
      t(
        "practice.loadingMessages.finishing",
        "Almost ready! Finalizing your test..."
      ),
    ],
    [t]
  );

  // Add useEffect for rotating messages during loading
  useEffect(() => {
    // Don't rotate messages if not generating questions
    if (!generatingQuestions) return;

    // Use a stable reference to the messages
    const messages = loadingMessages;

    // Set the first message
    setLoadingMessage(messages[0]);

    // Keep a reference to the index outside of the interval
    let messageIndex = 0;

    // Set up the rotation interval
    const timer = setInterval(() => {
      // Update the index and wrap around when reaching the end
      messageIndex = (messageIndex + 1) % messages.length;
      // Set the new message
      setLoadingMessage(messages[messageIndex]);
    }, 3000); // Rotate every 3 seconds

    // Clean up the interval when the component unmounts or loading state changes
    return () => clearInterval(timer);
  }, [generatingQuestions]); // Only depend on generatingQuestions state

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

  const generateAIQuestions = useCallback(
    async (flashcards, config) => {
      try {
        setGeneratingQuestions(true);

        console.log("========== GENERATING AI QUESTIONS ==========");
        console.log("Flashcards count:", flashcards.length);
        console.log("Config:", config);
        console.log("Config language:", config.language);
        console.log("Config language type:", typeof config.language);
        console.log("Is config language null?", config.language === null);
        console.log(
          "Is config language undefined?",
          config.language === undefined
        );
        console.log("Is config language empty string?", config.language === "");
        console.log("Component language state:", language);
        console.log("Final language to use:", config.language || language);
        console.log("Supported languages:", Object.keys(SUPPORTED_LANGUAGES));
        console.log(
          "Is language supported?",
          (config.language || language) in SUPPORTED_LANGUAGES
        );

        const requestBody = {
          flashcards: flashcards.map((card) => ({
            front: cleanFlashcardContent(card.front),
            back: cleanFlashcardContent(card.back),
            id: card.id,
          })),
          numQuestions: config.numQuestions,
          questionTypes: config.questionTypes,
          language: config.language || language,
        };

        console.log("Request body:", requestBody);
        console.log("Request body language:", requestBody.language);
        console.log("Request body language type:", typeof requestBody.language);
        console.log("===========================================");

        const response = await fetch("/api/generate-questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API error response:", errorText);
          throw new Error(
            `Failed to generate questions: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        console.log("API response data:", data);
        return data.questions;
      } catch (error) {
        console.error("Error generating AI questions:", error);
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
        throw error;
      } finally {
        setGeneratingQuestions(false);
      }
    },
    [language]
  );

  const loadTest = useCallback(async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      console.log("========== LOADING TEST ==========");
      console.log("User ID:", user.id);
      console.log("Flashcard set ID:", params.id);

      const config = JSON.parse(searchParams.get("config"));
      console.log("Config from URL:", config);
      console.log("Config question types:", config.questionTypes);
      console.log("Config number of questions:", config.numQuestions);

      const docRef = doc(db, "users", user.id, "flashcardSets", params.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setSetName(data.name || "Untitled Set");

        console.log("Flashcard set data:", data);
        console.log("Flashcard set name:", data.name);
        console.log("Flashcard set language:", data.language);
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

        // Set the language if available
        let flashcardLanguage = "en"; // Default to English
        if (data.language && SUPPORTED_LANGUAGES[data.language]) {
          flashcardLanguage = data.language;
          setLanguage(data.language);
          console.log("Setting language to:", data.language);
          console.log(
            "Language display name:",
            SUPPORTED_LANGUAGES[data.language]
          );
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
        console.log(`Flashcard set language: ${data.language || "not set"}`);

        if (!data.flashcards || data.flashcards.length === 0) {
          setError("No flashcards found in this set");
          setLoading(false);
          return;
        }

        console.log("Number of flashcards:", data.flashcards.length);

        const questionTypes = Array.isArray(config.questionTypes)
          ? config.questionTypes
          : [config.questionTypes];

        console.log("Processed question types:", questionTypes);

        const aiQuestions = await generateAIQuestions(data.flashcards, {
          ...config,
          questionTypes,
          language: data.language, // Pass the language from the flashcard set
        });

        console.log("AI questions generated:", aiQuestions.length);

        const filteredQuestions = aiQuestions.filter((q) =>
          questionTypes.includes(q.type)
        );

        console.log("Filtered questions:", filteredQuestions.length);
        console.log(
          "First question language check:",
          filteredQuestions[0]?.question.substring(0, 50)
        );
        console.log("=================================");

        setQuestions(filteredQuestions);
        setStartTime(new Date());
      } else {
        console.log("Flashcard set not found");
        setError("Flashcard set not found");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading test:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
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

      // Create test results with schema validation
      const testResultsData = {
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

      // Validate the test results data using our schema helper
      const validatedTestResults = createTestResult(testResultsData);

      await addDoc(testResultsRef, validatedTestResults);
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
              ? loadingMessage ||
                t(
                  "practice.generatingQuestions",
                  "Generating practice questions..."
                )
              : t("messages.loading", "Loading...")}
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
          {t("buttons.back", "Back to Practice")}
        </Button>
      </Container>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleBackToPractice}
            startIcon={<ArrowBackIcon />}
          >
            {t("buttons.back", "Back to Practice")}
          </Button>

          {/* Language indicator */}
          <Chip
            icon={<TranslateIcon />}
            label={SUPPORTED_LANGUAGES[language] || "English"}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>

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
                  {t("practice.testResults", "Test Results")}
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
                      ? t("practice.excellent", "Excellent!")
                      : score >= 50
                      ? t("practice.goodEffort", "Good effort!")
                      : t("practice.keepPracticing", "Keep practicing!")}
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: "medium" }}
                  >
                    {t("practice.questionReview", "Question Review:")}
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
                                {t("practice.question", "Question")} {index + 1}
                              </Typography>
                            </Box>
                            <Typography>
                              {cleanFlashcardContent(question.question)}
                            </Typography>
                            <Typography color="text.secondary">
                              {t("practice.yourAnswer", "Your answer:")}{" "}
                              {typeof answers[index] === "string"
                                ? cleanFlashcardContent(answers[index])
                                : answers[index]?.toString() ||
                                  t("practice.notAnswered", "Not answered")}
                            </Typography>
                            <Typography
                              sx={{
                                color: isCorrect
                                  ? "success.main"
                                  : "error.main",
                              }}
                            >
                              {t("practice.correctAnswer", "Correct answer:")}{" "}
                              {typeof question.correctAnswer === "string"
                                ? cleanFlashcardContent(
                                    question.correctAnswer.toString()
                                  )
                                : question.correctAnswer.toString()}
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
                    {t("buttons.back", "Back to Practice")}
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
                    {t("practice.retryTest", "Retry Test")}
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
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleBackToPractice}
            startIcon={<ArrowBackIcon />}
          >
            {t("buttons.back", "Back to Practice")}
          </Button>

          {/* Language indicator */}
          <Chip
            icon={<TranslateIcon />}
            label={SUPPORTED_LANGUAGES[language] || "English"}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>

        <Typography variant="h4" sx={{ mb: 1, textAlign: "center" }}>
          {setName || t("practice.practiceTest", "Practice Test")}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={(currentQuestionIndex / questions.length) * 100}
          sx={{ mb: 4, height: 8, borderRadius: 4 }}
        />

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
            {t("practice.questionCount", {
              current: currentQuestionIndex + 1,
              total: questions.length,
            })}
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
                  {cleanFlashcardContent(currentQuestion.question)}
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
                                    {cleanFlashcardContent(option)}
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
                          { value: "true", label: t("practice.true", "True") },
                          {
                            value: "false",
                            label: t("practice.false", "False"),
                          },
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
                    placeholder={t("practice.typeAnswer", "Type your answer")}
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
            {t("buttons.previous", "Previous")}
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
            {currentQuestionIndex === questions.length - 1
              ? t("buttons.finish", "Finish")
              : t("buttons.next", "Next")}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
