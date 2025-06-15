"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Paper,
  Collapse,
  Grid,
  Container,
} from "@mui/material";
import { collection, query, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import InsightsIcon from "@mui/icons-material/Insights";
import {
  School as SchoolIcon,
  Lightbulb as LightbulbIcon,
  Quiz as QuizIcon,
  Topic as TopicIcon,
  Style as CardIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
} from "@mui/icons-material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { keyframes } from "@mui/system";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ArticleIcon from "@mui/icons-material/Article";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ReviewDialog from "./review/ReviewDialog";
import { useLanguage } from "../contexts/LanguageContext";
import useTranslation from "../hooks/useTranslation";

const fireAnimation = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-2px) rotate(-5deg); }
  75% { transform: translateY(2px) rotate(5deg); }
  100% { transform: translateY(0) rotate(0deg); }
`;

// Add a helper for conditional logging
const isDevMode = process.env.NODE_ENV === "development";
const debugLog = (...args) => {
  // Only log in development mode
  if (isDevMode) {
    console.log(...args);
  }
};

export default function PerformanceAnalytics() {
  const { user } = useUser();
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    areasForImprovement: true,
    recommendations: true,
  });
  const [reviewContent, setReviewContent] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    byQuestionType: {},
    frequentlyMissed: [],
    weakTopics: [],
    recommendations: [],
    topicQuestions: new Map(),
    studyStreak: 0,
    totalTestsTaken: 0,
    averageScore: 0,
  });
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [topicForReview, setTopicForReview] = useState(null);
  const { language } = useLanguage();

  // Memoize the current UI language to prevent unnecessary re-renders
  const currentLanguage = useMemo(() => language, [language]);

  // Add a flag to track if analytics have been loaded
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  // Use a ref to further prevent multiple loads
  const analyticsLoadingRef = useRef(false);

  // Memoize router actions to prevent unnecessary re-renders
  const navigateToSetId = useCallback(
    (setId) => {
      router.push(`/practice?setId=${encodeURIComponent(setId)}`);
    },
    [router]
  );

  const navigateToQuestionType = useCallback(
    (questionType) => {
      router.push(`/practice?questionTypes=${questionType}`);
    },
    [router]
  );

  // Memoized translations to prevent unnecessary re-renders
  const translations = useMemo(
    () => ({
      focusOn: (topic, accuracy) =>
        t("dashboard.performance.focusOn", {
          topic,
          accuracy,
        }),
      practiceMore: (type) =>
        t("dashboard.performance.practiceMore", {
          type: type.replace(/([A-Z])/g, " $1").toLowerCase(),
        }),
    }),
    [t]
  );

  const loadAnalytics = useCallback(async () => {
    // Extra protection against multiple loads
    if (!user || analyticsLoaded || analyticsLoadingRef.current) return;

    // Set loading ref to true to prevent concurrent loads
    analyticsLoadingRef.current = true;
    setLoading(true);
    try {
      const testResultsRef = collection(db, "users", user.id, "testResults");
      const querySnapshot = await getDocs(testResultsRef);

      // Initialize data structures
      const topicStats = new Map(); // Map to track topic statistics
      const questionTypeStats = {};
      const missedQuestions = [];
      let totalScore = 0;
      let testCount = 0;

      // Process each test result
      querySnapshot.forEach((doc) => {
        const test = doc.data();
        totalScore += test.score || 0;
        testCount++;

        // Process questions in the test
        test.questionDetails?.forEach((question) => {
          // Track question type statistics
          const type = question.type || "unknown";
          if (!questionTypeStats[type]) {
            questionTypeStats[type] = { correct: 0, total: 0 };
          }
          questionTypeStats[type].total++;
          if (question.isCorrect) {
            questionTypeStats[type].correct++;
          }

          // Track topic statistics (case-insensitive)
          if (test.setName) {
            const normalizedTopic = test.setName.toLowerCase();
            const displayTopic =
              test.setName.charAt(0).toUpperCase() +
              test.setName.slice(1).toLowerCase();

            if (!topicStats.has(normalizedTopic)) {
              topicStats.set(normalizedTopic, {
                name: displayTopic,
                correctAnswers: 0,
                totalQuestions: 0,
                setId: test.flashcardSetId,
                language: test.language,
              });
            }

            const stats = topicStats.get(normalizedTopic);
            if (question.isCorrect) {
              stats.correctAnswers++;
            }
            stats.totalQuestions++;
          }

          // Track missed questions
          if (!question.isCorrect) {
            missedQuestions.push({
              ...question,
              topic: test.setName,
              setId: test.setId,
            });
          }
        });
      });

      // Convert topic statistics to array and sort by accuracy
      const weakTopics = Array.from(topicStats.values())
        .map((stats) => ({
          ...stats,
          accuracy:
            stats.totalQuestions > 0
              ? (stats.correctAnswers / stats.totalQuestions) * 100
              : 0,
        }))
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 5); // Keep only the 5 weakest topics

      // Generate recommendations
      const recommendations = [];

      // Question type recommendations
      const weakestType = Object.entries(questionTypeStats)
        .map(([type, stats]) => ({
          type,
          accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 100,
        }))
        .sort((a, b) => a.accuracy - b.accuracy)[0];

      if (weakestType && weakestType.accuracy < 70) {
        recommendations.push({
          type: "questionType",
          message: translations.practiceMore(weakestType.type),
          priority: 2,
          action: () => navigateToQuestionType(weakestType.type),
          config: {
            questionType: weakestType.type,
          },
        });
      }

      // Topic-based recommendations
      if (weakTopics.length > 0) {
        const topicWithLanguage = {
          topic: weakTopics[0].name,
          language: weakTopics[0].language,
          setId: weakTopics[0].setId,
        };

        recommendations.push({
          type: "topic",
          message: translations.focusOn(
            weakTopics[0].name,
            weakTopics[0].accuracy.toFixed(1)
          ),
          priority: 1,
          topic: topicWithLanguage,
          action: () => navigateToSetId(weakTopics[0].setId),
          config: {
            setId: weakTopics[0].setId,
            language: weakTopics[0].language,
          },
        });
      }

      // Update analytics state
      setAnalytics((prev) => ({
        ...prev,
        weakTopics,
        byQuestionType: questionTypeStats,
        frequentlyMissed: missedQuestions,
        recommendations: recommendations.sort(
          (a, b) => a.priority - b.priority
        ),
        totalTestsTaken: testCount,
        averageScore: testCount > 0 ? totalScore / testCount : 0,
      }));

      setAnalyticsLoaded(true); // Mark as loaded to prevent repeated loads
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
      // Always reset loading ref even if there was an error
      analyticsLoadingRef.current = false;
    }
  }, [
    user,
    navigateToSetId,
    navigateToQuestionType,
    translations,
    analyticsLoaded,
  ]);

  useEffect(() => {
    if (user && !analyticsLoaded) {
      loadAnalytics();
    }
  }, [user, loadAnalytics, analyticsLoaded]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const generateReviewContent = async (topicObj) => {
    try {
      const response = await fetch("/api/generate-review-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify(topicObj),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`Server error: ${errorText}`);
      }

      // Handle streaming response with a more robust method
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedJson = "";
      let lastGoodContent = null;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break; // Exit loop when stream is finished
        }

        accumulatedJson += decoder.decode(value, { stream: true });

        // Try to parse the accumulated data. This is expected to fail until the JSON is complete.
        try {
          const cleanedData = accumulatedJson
            .replace(/```json\n?|\n?```/g, "")
            .trim();

          if (cleanedData) {
            lastGoodContent = JSON.parse(cleanedData);
          }
        } catch (error) {
          // This is expected, it means we have incomplete JSON.
          // We'll just wait for more chunks.
          debugLog("Incomplete JSON chunk, waiting for more data...");
        }
      }

      if (lastGoodContent) {
        setReviewContent(lastGoodContent);
      } else {
        console.error("Failed to parse any valid JSON from the stream.");
        console.error("Final raw data received:", accumulatedJson);
        throw new Error("Invalid or empty JSON response from server");
      }
    } catch (error) {
      console.error("Error generating review content:", error);
      setReviewContent({
        error: "Failed to generate review content.",
        details: error.message,
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const handleOpenReview = (topic) => {
    debugLog("handleOpenReview triggered for topic:", topic);
    setTopicForReview(topic);
    setReviewDialogOpen(true);
    setReviewContent(null);
    setReviewLoading(true);
  };

  useEffect(() => {
    if (reviewDialogOpen && topicForReview) {
      const topicName = topicForReview.name || topicForReview.topic;
      const topicLanguage = topicForReview.language;
      const topicSetId = topicForReview.setId;

      const topicObj = {
        topic: topicName,
        language: topicLanguage,
        setId: topicSetId,
      };

      debugLog(
        "useEffect triggering generateReviewContent for topic:",
        topicObj
      );
      generateReviewContent(topicObj);
    }
  }, [reviewDialogOpen, topicForReview]);

  const handleCloseReview = useCallback(() => {
    setReviewDialogOpen(false);
    setTopicForReview(null);
    setReviewContent(null);
    setReviewLoading(false);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatAccuracy = (correct, total) => {
    if (total === 0) return "N/A";
    return `${((correct / total) * 100).toFixed(1)}%`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(63, 81, 181, 0.15)",
          }}
        >
          <CardContent
            sx={{
              position: "relative",
              p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(121, 134, 203, 0.05) 100%)",
                borderRadius: 4,
                zIndex: 0,
              }}
            />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                <InsightsIcon
                  sx={{
                    fontSize: { xs: 32, md: 40 }, // Smaller icon on mobile
                    color: "#3f51b5",
                    filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))",
                    mr: 2,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    background:
                      "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" }, // Responsive font size
                  }}
                >
                  {t("dashboard.performance.title")}
                </Typography>
              </Box>

              <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                {" "}
                {/* Reduced spacing on smaller screens */}
                {analytics.weakTopics.length > 0 && (
                  <Grid item xs={12} md={5}>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Paper
                        sx={{
                          p: { xs: 1.5, sm: 2, md: 2.5 }, // Responsive padding
                          height: "100%",
                          borderRadius: "16px",
                          background: "#ffffff",
                          position: "relative",
                          overflow: "hidden",
                          transition: "transform 0.3s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-3px)",
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background:
                              "linear-gradient(90deg, #3f51b5, #7986cb, #3f51b5)",
                            backgroundSize: "200% 100%",
                            animation: "gradient 15s ease infinite",
                          },
                          "@keyframes gradient": {
                            "0%": { backgroundPosition: "0% 50%" },
                            "50%": { backgroundPosition: "100% 50%" },
                            "100%": { backgroundPosition: "0% 50%" },
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 2,
                            position: "relative",
                          }}
                        >
                          <SchoolIcon
                            sx={{
                              fontSize: 24,
                              color: "#3f51b5",
                              animation: "float 3s ease-in-out infinite",
                              "@keyframes float": {
                                "0%": { transform: "translateY(0px)" },
                                "50%": { transform: "translateY(-3px)" },
                                "100%": { transform: "translateY(0px)" },
                              },
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#1a237e",
                              fontWeight: 600,
                              fontSize: "1rem",
                              letterSpacing: "0.3px",
                            }}
                          >
                            {t("dashboard.performance.areasForImprovement")}
                          </Typography>
                        </Box>

                        <List sx={{ width: "100%" }}>
                          {analytics.weakTopics.map((topic, index) => (
                            <motion.div
                              key={topic.name}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Paper
                                elevation={0}
                                sx={{
                                  mb: 1.5,
                                  borderRadius: "12px",
                                  background: "rgba(255, 255, 255, 0.9)",
                                  backdropFilter: "blur(10px)",
                                  transition: "all 0.3s ease-in-out",
                                  border: "1px solid rgba(63, 81, 181, 0.1)",
                                  overflow: "hidden",
                                  cursor: "pointer",
                                  "&:hover": {
                                    transform: "scale(1.01)",
                                    borderColor: "rgba(63, 81, 181, 0.3)",
                                    "& .progress-indicator": {
                                      transform: "scale(1.03)",
                                    },
                                  },
                                }}
                              >
                                <Box sx={{ p: { xs: 1, sm: 1.5 } }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        color: "#1a237e",
                                        fontWeight: 500,
                                        fontSize: "0.875rem",
                                        maxWidth: "80%",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {topic.name}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        color:
                                          topic.accuracy < 50
                                            ? "#f44336"
                                            : topic.accuracy < 70
                                            ? "#ff9800"
                                            : "#4caf50",
                                        fontWeight: 600,
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      {topic.accuracy.toFixed(1)}%
                                    </Typography>
                                  </Box>

                                  <Box
                                    sx={{
                                      position: "relative",
                                      height: "6px",
                                      borderRadius: "3px",
                                      bgcolor: "rgba(63, 81, 181, 0.1)",
                                    }}
                                  >
                                    <motion.div
                                      className="progress-indicator"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${topic.accuracy}%` }}
                                      transition={{
                                        duration: 1,
                                        ease: "easeOut",
                                      }}
                                      style={{
                                        position: "absolute",
                                        height: "100%",
                                        borderRadius: "3px",
                                        background:
                                          topic.accuracy < 50
                                            ? "linear-gradient(90deg, #ff8a80, #f44336)"
                                            : topic.accuracy < 70
                                            ? "linear-gradient(90deg, #ffd180, #ff9800)"
                                            : "linear-gradient(90deg, #a5d6a7, #4caf50)",
                                        transition:
                                          "transform 0.3s ease-in-out",
                                      }}
                                    />
                                  </Box>

                                  <Box
                                    sx={{
                                      mt: 1,
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      gap: 1,
                                    }}
                                  >
                                    <Chip
                                      label={t("buttons.studyNow")}
                                      size="small"
                                      sx={{
                                        height: "22px",
                                        minWidth: { xs: 62, sm: 70 },
                                        maxWidth: { xs: 80, sm: 100 },
                                        bgcolor: "rgba(63, 81, 181, 0.1)",
                                        color: "#3f51b5",
                                        fontWeight: 500,
                                        fontSize: "0.7rem",
                                        transition: "all 0.3s ease",
                                        "& .MuiChip-label": {
                                          px: 1,
                                          width: "100%",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        },
                                        "&:hover": {
                                          bgcolor: "rgba(63, 81, 181, 0.2)",
                                        },
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenReview(topic);
                                      }}
                                    />
                                    <Chip
                                      label={t("buttons.practiceThisTopic")}
                                      size="small"
                                      sx={{
                                        height: "22px",
                                        minWidth: { xs: 98, sm: 120 },
                                        maxWidth: { xs: 130, sm: 160 },
                                        bgcolor: "rgba(63, 81, 181, 0.1)",
                                        color: "#3f51b5",
                                        fontWeight: 500,
                                        fontSize: "0.7rem",
                                        transition: "all 0.3s ease",
                                        "& .MuiChip-label": {
                                          px: 1,
                                          width: "100%",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        },
                                        "&:hover": {
                                          bgcolor: "rgba(63, 81, 181, 0.2)",
                                        },
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(
                                          `/practice?setId=${encodeURIComponent(
                                            topic.setId
                                          )}`
                                        );
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </Paper>
                            </motion.div>
                          ))}
                        </List>
                      </Paper>
                    </motion.div>
                  </Grid>
                )}
                {analytics.recommendations.length > 0 && (
                  <Grid item xs={12} md={7}>
                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Paper
                        sx={{
                          p: { xs: 1.5, sm: 2, md: 2.5 }, // Responsive padding
                          height: "100%",
                          borderRadius: "16px",
                          background: "#ffffff",
                          position: "relative",
                          overflow: "hidden",
                          transition: "transform 0.3s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-3px)",
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background:
                              "linear-gradient(90deg, #7c4dff, #b388ff, #7c4dff)",
                            backgroundSize: "200% 100%",
                            animation: "gradient 15s ease infinite",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 2,
                            position: "relative",
                          }}
                        >
                          <LightbulbIcon
                            sx={{
                              fontSize: 24,
                              color: "#7c4dff",
                              animation: "float 3s ease-in-out infinite",
                              "@keyframes float": {
                                "0%": { transform: "translateY(0px)" },
                                "50%": { transform: "translateY(-3px)" },
                                "100%": { transform: "translateY(0px)" },
                              },
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#4a148c",
                              fontWeight: 600,
                              fontSize: "1rem",
                              letterSpacing: "0.3px",
                            }}
                          >
                            {t("dashboard.performance.recommendations")}
                          </Typography>
                        </Box>

                        <List sx={{ width: "100%" }}>
                          {analytics.recommendations.map((rec, index) => (
                            <Paper
                              key={index}
                              elevation={0}
                              sx={{
                                p: { xs: 1.5, sm: 2, md: 2.5 }, // Responsive padding
                                mb: 1.5,
                                borderRadius: "16px",
                                bgcolor: "#ffffff",
                                border: "1px solid rgba(124, 77, 255, 0.1)",
                                transition: "all 0.3s ease",
                                cursor:
                                  rec.type === "topic" ? "pointer" : "default",
                                "&:hover": {
                                  transform: "translateY(-2px)",
                                  boxShadow:
                                    "0 4px 12px rgba(124, 77, 255, 0.08)",
                                  borderColor: "rgba(124, 77, 255, 0.2)",
                                },
                              }}
                              onClick={() => {
                                if (rec.type === "topic") {
                                  handleOpenReview(rec.topic);
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 1.5,
                                }}
                              >
                                {rec.type === "questionType" && (
                                  <QuizIcon
                                    sx={{
                                      color: "#7c4dff",
                                      fontSize: { xs: "20px", sm: "24px" }, // Smaller on mobile
                                      mt: 0.5,
                                    }}
                                  />
                                )}
                                {rec.type === "topic" && (
                                  <TopicIcon
                                    sx={{
                                      color: "#7c4dff",
                                      fontSize: { xs: "20px", sm: "24px" }, // Smaller on mobile
                                      mt: 0.5,
                                    }}
                                  />
                                )}
                                {rec.type === "card" && (
                                  <CardIcon
                                    sx={{
                                      color: "#7c4dff",
                                      fontSize: { xs: "20px", sm: "24px" }, // Smaller on mobile
                                      mt: 0.5,
                                    }}
                                  />
                                )}
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: "#1a237e",
                                      fontSize: { xs: "0.85rem", sm: "0.9rem" }, // Smaller on mobile
                                      fontWeight: 500,
                                      mb: 0.5,
                                    }}
                                  >
                                    {rec.message}
                                  </Typography>
                                  {rec.type === "topic" && (
                                    <Box
                                      sx={{
                                        mt: 1,
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 1,
                                      }}
                                    >
                                      <Chip
                                        label={t("buttons.practiceThisTopic")}
                                        size="small"
                                        sx={{
                                          height: "22px",
                                          minWidth: { xs: 98, sm: 120 },
                                          maxWidth: { xs: 130, sm: 160 },
                                          bgcolor: "rgba(124, 77, 255, 0.1)",
                                          color: "#7c4dff",
                                          fontWeight: 500,
                                          fontSize: "0.7rem",
                                          transition: "all 0.3s ease",
                                          "& .MuiChip-label": {
                                            px: 1,
                                            width: "100%",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          },
                                          "&:hover": {
                                            bgcolor: "rgba(124, 77, 255, 0.2)",
                                          },
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(
                                            `/practice?topic=${encodeURIComponent(
                                              rec.topic.topic
                                            )}`
                                          );
                                        }}
                                      />
                                    </Box>
                                  )}
                                  {rec.type === "questionType" && (
                                    <Box
                                      sx={{
                                        mt: 1,
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 1,
                                      }}
                                    >
                                      <Chip
                                        label={t("buttons.startPractice")}
                                        size="small"
                                        sx={{
                                          height: "22px",
                                          minWidth: { xs: 82, sm: 90 },
                                          maxWidth: { xs: 120, sm: 140 },
                                          bgcolor: "rgba(124, 77, 255, 0.1)",
                                          color: "#7c4dff",
                                          fontWeight: 500,
                                          fontSize: "0.7rem",
                                          transition: "all 0.3s ease",
                                          "& .MuiChip-label": {
                                            px: 1,
                                            width: "100%",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          },
                                          "&:hover": {
                                            bgcolor: "rgba(124, 77, 255, 0.2)",
                                          },
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Navigate to practice test generator with the specific question type pre-selected
                                          router.push(
                                            `/practice?questionTypes=${rec.config?.questionType}`
                                          );
                                        }}
                                      />
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </Paper>
                          ))}
                        </List>
                      </Paper>
                    </motion.div>
                  </Grid>
                )}
              </Grid>

              <AnimatePresence>
                {reviewDialogOpen && (
                  <ReviewDialog
                    open={reviewDialogOpen}
                    onClose={handleCloseReview}
                    content={reviewContent}
                    loading={reviewLoading}
                    topic={topicForReview}
                  />
                )}
              </AnimatePresence>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
}
