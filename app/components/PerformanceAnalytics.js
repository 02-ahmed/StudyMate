"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [topicForReview, setTopicForReview] = useState("");

  const loadAnalytics = useCallback(async () => {
    if (!user) return;

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
                setId: test.setId,
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
          accuracy: (stats.correctAnswers / stats.totalQuestions) * 100,
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
          message: t("dashboard.performance.practiceMore", {
            type: weakestType.type.replace(/([A-Z])/g, " $1").toLowerCase(),
          }),
          priority: 2,
          action: () => router.push(`/practice?type=${weakestType.type}`),
          config: {
            questionType: weakestType.type,
          },
        });
      }

      // Topic-based recommendations
      if (weakTopics.length > 0) {
        recommendations.push({
          type: "topic",
          message: t("dashboard.performance.focusOn", {
            topic: weakTopics[0].name,
            accuracy: weakTopics[0].accuracy.toFixed(1),
          }),
          priority: 1,
          action: () =>
            router.push(
              `/practice?setId=${encodeURIComponent(weakTopics[0].setId)}`
            ),
          config: {
            setId: weakTopics[0].setId,
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

      setLoading(false);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setLoading(false);
    }
  }, [user, router, t]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, loadAnalytics]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const generateReviewContent = async (topic, language) => {
    setReviewLoading(true);
    setReviewDialogOpen(true);
    setTopicForReview(topic);

    try {
      const response = await fetch("/api/generate-review-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReviewContent(data);
    } catch (error) {
      console.error("Error generating review content:", error);
      setReviewContent(null);
    } finally {
      setReviewLoading(false);
    }
  };

  const renderReviewDialog = () => (
    <ReviewDialog
      open={reviewDialogOpen}
      onClose={() => {
        setReviewDialogOpen(false);
        setReviewContent(null);
        setReviewLoading(false);
      }}
      content={reviewContent}
      loading={reviewLoading}
      topic={topicForReview}
    />
  );

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
          <CardContent sx={{ position: "relative" }}>
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
                    fontSize: 40,
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
                  }}
                >
                  {t("dashboard.performance.title")}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {analytics.weakTopics.length > 0 && (
                  <Grid item xs={12} md={5}>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Paper
                        sx={{
                          p: 2.5,
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
                                <Box sx={{ p: 1.5 }}>
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
                                        bgcolor: "rgba(63, 81, 181, 0.1)",
                                        color: "#3f51b5",
                                        fontWeight: 500,
                                        fontSize: "0.7rem",
                                        transition: "all 0.3s ease",
                                        "& .MuiChip-label": {
                                          px: 1,
                                        },
                                        "&:hover": {
                                          bgcolor: "rgba(63, 81, 181, 0.2)",
                                        },
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        generateReviewContent(
                                          topic.name,
                                          topic.language
                                        );
                                      }}
                                    />
                                    <Chip
                                      label={t("buttons.practiceThisTopic")}
                                      size="small"
                                      sx={{
                                        height: "22px",
                                        bgcolor: "rgba(63, 81, 181, 0.1)",
                                        color: "#3f51b5",
                                        fontWeight: 500,
                                        fontSize: "0.7rem",
                                        transition: "all 0.3s ease",
                                        "& .MuiChip-label": {
                                          px: 1,
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
                          p: 2.5,
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
                                p: 2.5,
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
                              onClick={() =>
                                rec.type === "topic" &&
                                generateReviewContent(
                                  rec.topic,
                                  rec.config?.language
                                )
                              }
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
                                      fontSize: "24px",
                                      mt: 0.5,
                                    }}
                                  />
                                )}
                                {rec.type === "topic" && (
                                  <TopicIcon
                                    sx={{
                                      color: "#7c4dff",
                                      fontSize: "24px",
                                      mt: 0.5,
                                    }}
                                  />
                                )}
                                {rec.type === "card" && (
                                  <CardIcon
                                    sx={{
                                      color: "#7c4dff",
                                      fontSize: "24px",
                                      mt: 0.5,
                                    }}
                                  />
                                )}
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: "#1a237e",
                                      fontSize: "0.9rem",
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
                                          bgcolor: "rgba(124, 77, 255, 0.1)",
                                          color: "#7c4dff",
                                          fontWeight: 500,
                                          fontSize: "0.7rem",
                                          transition: "all 0.3s ease",
                                          "& .MuiChip-label": {
                                            px: 1,
                                          },
                                          "&:hover": {
                                            bgcolor: "rgba(124, 77, 255, 0.2)",
                                          },
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(
                                            `/practice?topic=${encodeURIComponent(
                                              rec.topic
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
                                          bgcolor: "rgba(124, 77, 255, 0.1)",
                                          color: "#7c4dff",
                                          fontWeight: 500,
                                          fontSize: "0.7rem",
                                          transition: "all 0.3s ease",
                                          "& .MuiChip-label": {
                                            px: 1,
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

              {renderReviewDialog()}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
}
