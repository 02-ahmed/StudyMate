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
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { keyframes } from "@mui/system";
import SchoolIcon from "@mui/icons-material/School";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ArticleIcon from "@mui/icons-material/Article";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ReviewDialog from "./review/ReviewDialog";

const fireAnimation = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-2px) rotate(-5deg); }
  75% { transform: translateY(2px) rotate(5deg); }
  100% { transform: translateY(0) rotate(0deg); }
`;

export default function PerformanceAnalytics() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [reviewContent, setReviewContent] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    byQuestionType: {},
    frequentlyMissed: [],
    weakTopics: [],
    recommendations: [],
    topicQuestions: new Map(), // Store questions by topic
    studyStreak: 0,
    totalTestsTaken: 0,
    averageScore: 0,
  });
  const [selectedCard, setSelectedCard] = useState(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [resources, setResources] = useState({ articles: [], videos: [] });
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [topicForReview, setTopicForReview] = useState("");

  const loadAnalytics = useCallback(async () => {
    try {
      // Get recent test results
      const testResultsRef = collection(db, "users", user.id, "testResults");
      const testSnapshot = await getDocs(testResultsRef);

      // Initialize analytics data
      const questionTypeStats = {
        multipleChoice: { correct: 0, total: 0 },
        trueFalse: { correct: 0, total: 0 },
        fillInBlank: { correct: 0, total: 0 },
      };

      const missedQuestions = new Map();
      const topicPerformance = new Map();
      const topicQuestions = new Map();
      let totalScore = 0;
      let testCount = 0;
      let lastTestDate = null;
      let streak = 0;

      // Process each test result
      for (const testDoc of testSnapshot.docs) {
        const testData = testDoc.data();
        testCount++;
        totalScore += testData.score || 0;

        // Calculate streak
        const testDate = new Date(testData.dateTaken.toDate()).toDateString();
        const currentDate = new Date().toDateString();

        if (lastTestDate) {
          const dayDiff = Math.abs(
            (new Date(testDate) - new Date(lastTestDate)) /
              (1000 * 60 * 60 * 24)
          );
          if (dayDiff <= 1) {
            streak++;
          } else {
            streak = 1;
          }
        } else {
          streak = 1;
        }

        // Check if the last test was more than a day ago
        const daysSinceLastTest = Math.abs(
          (new Date(currentDate) - new Date(testDate)) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastTest > 1) {
          streak = 0;
        }

        lastTestDate = testDate;

        // Use set name instead of tags for performance tracking
        const setName = testData.setName || "Untitled Set";
        const setId = testData.flashcardSetId;

        // Process questions
        testData.questionDetails.forEach((detail) => {
          // Update question type stats
          const typeStats = questionTypeStats[detail.type];
          if (typeStats) {
            typeStats.total++;
            if (detail.isCorrect) typeStats.correct++;
          }

          // Track questions by set name
          if (!topicQuestions.has(setName)) {
            topicQuestions.set(setName, []);
          }
          const questions = topicQuestions.get(setName);
          const existingQuestion = questions.find(
            (q) => q.question === detail.question
          );
          if (!existingQuestion) {
            questions.push({
              question: detail.question,
              answer: detail.correctAnswer,
              type: detail.type,
              correctCount: detail.isCorrect ? 1 : 0,
              totalAttempts: 1,
            });
          } else {
            existingQuestion.totalAttempts++;
            if (detail.isCorrect) existingQuestion.correctCount++;
          }

          // Track missed questions
          if (!detail.isCorrect) {
            const key = `${detail.question}|${detail.correctAnswer}`;
            const current = missedQuestions.get(key) || {
              question: detail.question,
              answer: detail.correctAnswer,
              count: 0,
              type: detail.type,
              setName: setName,
              setId: setId,
            };
            current.count++;
            missedQuestions.set(key, current);

            // Update set performance
            const setStats = topicPerformance.get(setName) || {
              correct: 0,
              total: 0,
              setId: setId,
            };
            setStats.total++;
            topicPerformance.set(setName, setStats);
          } else {
            // Update set performance for correct answers
            const setStats = topicPerformance.get(setName) || {
              correct: 0,
              total: 0,
              setId: setId,
            };
            setStats.total++;
            setStats.correct++;
            topicPerformance.set(setName, setStats);
          }
        });
      }

      // Calculate weak topics (now based on set names)
      const weakTopics = Array.from(topicPerformance.entries())
        .map(([setName, stats]) => ({
          topic: setName,
          setId: stats.setId,
          accuracy: (stats.correct / stats.total) * 100,
          questions: topicQuestions.get(setName) || [],
        }))
        .filter((topic) => topic.accuracy < 70)
        .sort((a, b) => a.accuracy - b.accuracy);

      // Get frequently missed questions
      const frequentlyMissed = Array.from(missedQuestions.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

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
          message: `Practice more ${weakestType.type
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} questions`,
          priority: 3,
          action: () => router.push(`/practice?type=${weakestType.type}`),
          config: {
            questionType: weakestType.type,
          },
        });
      }

      // Topic-based recommendations (now using set names)
      if (weakTopics.length > 0) {
        recommendations.push({
          type: "topic",
          message: `Focus on reviewing ${
            weakTopics[0].topic
          } (${weakTopics[0].accuracy.toFixed(1)}% accuracy)`,
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

      // Question-based recommendations
      if (frequentlyMissed.length > 0) {
        // Group missed questions by set name
        const missedBySet = {};

        // First add all weak topics
        weakTopics.forEach((topic) => {
          missedBySet[topic.topic] = {
            questions: [],
            accuracy: topic.accuracy,
            setId: topic.setId,
          };
        });

        // Then add frequently missed questions to their respective sets
        frequentlyMissed.forEach((question) => {
          if (!missedBySet[question.setName]) {
            const setStats = topicPerformance.get(question.setName) || {
              correct: 0,
              total: 0,
              setId: question.setId,
            };
            const accuracy =
              setStats.total > 0
                ? (setStats.correct / setStats.total) * 100
                : 0;
            missedBySet[question.setName] = {
              questions: [],
              accuracy: accuracy,
              setId: question.setId,
            };
          }
          missedBySet[question.setName].questions.push(question);
        });

        // Convert to array and sort by accuracy
        const sortedSets = Object.entries(missedBySet)
          .map(([setName, data]) => ({
            topic: setName,
            setId: data.setId,
            questions: data.questions,
            count: data.questions.length,
            accuracy: data.accuracy,
          }))
          .sort((a, b) => a.accuracy - b.accuracy);

        recommendations.push({
          type: "card",
          message: "Review these frequently missed topics",
          cards: frequentlyMissed.slice(0, 3),
          topics: sortedSets,
          priority: 2,
          action: () => {
            router.push(
              `/review?topics=${encodeURIComponent(JSON.stringify(sortedSets))}`
            );
          },
          config: {
            sets: sortedSets.map((s) => ({ name: s.topic, id: s.setId })),
            focusOnMissed: true,
          },
        });
      }

      // Study streak recommendation
      if (streak > 0) {
        recommendations.push({
          type: "streak",
          message: `You're on a ${streak}-day study streak! Keep it up!`,
          priority: 4,
        });
      }

      setAnalytics({
        byQuestionType: questionTypeStats,
        frequentlyMissed,
        weakTopics,
        recommendations: recommendations.sort(
          (a, b) => a.priority - b.priority
        ),
        topicQuestions,
        studyStreak: streak,
        totalTestsTaken: testCount,
        averageScore: testCount > 0 ? totalScore / testCount : 0,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, loadAnalytics]);

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const generateExplanation = async (card) => {
    try {
      const response = await fetch("/api/generate-explanation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: card.question,
          answer: card.answer,
          tags: card.tags,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setAiExplanation(data.explanation);
      setResources(data.resources);
    } catch (error) {
      console.error("Error generating explanation:", error);
      setAiExplanation(
        "Sorry, there was an error generating the explanation. Please try again."
      );
      setResources({ articles: [], videos: [] });
    }
  };

  const generateReviewContent = async (topics) => {
    try {
      if (!topics?.[0]?.topic) {
        console.error("No topic provided to generateReviewContent");
        return;
      }

      setReviewLoading(true);
      setReviewDialogOpen(true); // Open dialog first to show loading state
      setTopicForReview(topics[0].topic);

      const response = await fetch("/api/generate-review-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topics[0].topic,
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
      setReviewDialogOpen(false); // Close dialog on error
    } finally {
      setReviewLoading(false);
    }
  };

  const renderExplanationDialog = () => {
    if (!selectedCard) return null;

    return (
      <Dialog
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
            color: "white",
          }}
        >
          <SchoolIcon />
          Enhanced Learning
          <IconButton
            onClick={() => setSelectedCard(null)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Question
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "rgba(63, 81, 181, 0.05)",
                borderRadius: 2,
              }}
            >
              <Typography>{selectedCard.question}</Typography>
            </Paper>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Correct Answer
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "rgba(76, 175, 80, 0.05)",
                borderRadius: 2,
                border: "1px solid rgba(76, 175, 80, 0.2)",
              }}
            >
              <Typography color="success.main">
                {selectedCard.answer}
              </Typography>
            </Paper>
          </Box>

          <Accordion
            defaultExpanded
            sx={{
              mb: 2,
              "&:before": { display: "none" },
              boxShadow: "none",
              bgcolor: "transparent",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: "rgba(63, 81, 181, 0.05)",
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LightbulbIcon color="primary" />
                <Typography variant="h6">AI Explanation</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                component="pre"
                sx={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  mt: 1,
                }}
              >
                {aiExplanation}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion
            sx={{
              mb: 2,
              "&:before": { display: "none" },
              boxShadow: "none",
              bgcolor: "transparent",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: "rgba(63, 81, 181, 0.05)",
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ArticleIcon color="primary" />
                <Typography variant="h6">Related Articles</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {resources.articles.map((article, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      bgcolor: "white",
                      mb: 1,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: "rgba(63, 81, 181, 0.05)",
                      },
                    }}
                  >
                    <ListItemText
                      primary={article.title}
                      secondary={article.source}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read
                    </Button>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion
            sx={{
              "&:before": { display: "none" },
              boxShadow: "none",
              bgcolor: "transparent",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: "rgba(63, 81, 181, 0.05)",
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <YouTubeIcon color="primary" />
                <Typography variant="h6">Video Resources</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {resources.videos.map((video, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      bgcolor: "white",
                      mb: 1,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: "rgba(63, 81, 181, 0.05)",
                      },
                    }}
                  >
                    <ListItemText
                      primary={video.title}
                      secondary={`Duration: ${video.duration}`}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Watch
                    </Button>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
      </Dialog>
    );
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
                  Performance Insights
                </Typography>
              </Box>

              {analytics.studyStreak > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      mb: 3,
                      borderRadius: 3,
                      background:
                        "linear-gradient(135deg, #ff9800 0%, #ff5722 100%)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      boxShadow: "0 8px 32px rgba(255, 152, 0, 0.3)",
                    }}
                  >
                    <LocalFireDepartmentIcon
                      sx={{
                        fontSize: 40,
                        animation: `${fireAnimation} 2s infinite`,
                      }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {analytics.studyStreak} Day Streak!
                      </Typography>
                      <Typography variant="body2">
                        Keep up the great work! You&apos;re on fire! 🔥
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              )}

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
                          p: 3,
                          height: "100%",
                          borderRadius: 3,
                          background: "rgba(255, 255, 255, 0.9)",
                          backdropFilter: "blur(10px)",
                          boxShadow: "0 8px 32px rgba(63, 81, 181, 0.1)",
                          position: "relative",
                          overflow: "hidden",
                          maxWidth: "100%",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              "linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(121, 134, 203, 0.05) 100%)",
                            zIndex: 0,
                          },
                          "& > *": {
                            position: "relative",
                            zIndex: 1,
                          },
                        }}
                      >
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            color: "#1a237e",
                            fontWeight: 600,
                            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                        >
                          Areas for Improvement
                        </Typography>
                        <List sx={{ width: "100%" }}>
                          {analytics.weakTopics.map((topic, index) => (
                            <motion.div
                              key={topic.topic}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <ListItem
                                sx={{
                                  mb: 1,
                                  bgcolor: "rgba(255, 255, 255, 0.8)",
                                  borderRadius: 2,
                                  backdropFilter: "blur(10px)",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                  transition:
                                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                                    bgcolor: "rgba(255, 255, 255, 0.9)",
                                  },
                                }}
                              >
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      color: "#1a237e",
                                      fontWeight: 600,
                                      fontSize: "1.1rem",
                                      mb: 0.5,
                                    }}
                                  >
                                    {topic.topic}
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={topic.accuracy}
                                  sx={{
                                    width: 80,
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: "rgba(63, 81, 181, 0.1)",
                                    "& .MuiLinearProgress-bar": {
                                      bgcolor:
                                        topic.accuracy < 50
                                          ? "#f44336"
                                          : topic.accuracy < 70
                                          ? "#ff9800"
                                          : "#4caf50",
                                      borderRadius: 4,
                                    },
                                  }}
                                />
                              </ListItem>
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
                          p: 3,
                          height: "100%",
                          borderRadius: 3,
                          background:
                            "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)",
                        }}
                      >
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            color: "#3f51b5",
                            fontWeight: 600,
                            mb: 3,
                            textAlign: { xs: "center", sm: "left" },
                          }}
                        >
                          Personalized Recommendations
                        </Typography>
                        <List sx={{ width: "100%" }}>
                          {analytics.recommendations.map((rec, index) => (
                            <motion.div
                              key={index}
                              initial={{ x: 20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <ListItem
                                sx={{
                                  mb: 2,
                                  bgcolor: "rgba(255, 255, 255, 0.9)",
                                  borderRadius: 3,
                                  flexDirection: "column",
                                  alignItems: "stretch",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                  transition:
                                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    alignItems: { xs: "stretch", sm: "center" },
                                    justifyContent: "space-between",
                                    width: "100%",
                                    gap: 2,
                                  }}
                                >
                                  <ListItemText
                                    primary={rec.message}
                                    primaryTypographyProps={{
                                      fontWeight: 600,
                                      color: "#1a237e",
                                      fontSize: "1rem",
                                    }}
                                  />
                                  {rec.type !== "card" && rec.action && (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={rec.action}
                                      sx={{
                                        borderRadius: 2,
                                        background:
                                          "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
                                        boxShadow:
                                          "0 3px 5px 2px rgba(63, 81, 181, .3)",
                                        minWidth: "100px",
                                        flexShrink: 0,
                                        py: 0.5,
                                        px: 2,
                                      }}
                                    >
                                      Take Action
                                    </Button>
                                  )}
                                </Box>
                                {rec.type === "card" && rec.topics && (
                                  <Box sx={{ width: "100%" }}>
                                    <Typography
                                      variant="subtitle2"
                                      color="text.secondary"
                                      sx={{
                                        mb: 2,
                                        textAlign: "left",
                                        fontWeight: 500,
                                      }}
                                    >
                                      Topics to review:
                                    </Typography>
                                    <Grid container spacing={2}>
                                      {rec.topics.map((topicData, idx) => (
                                        <Grid item xs={12} sm={6} key={idx}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "space-between",
                                              bgcolor:
                                                "rgba(63, 81, 181, 0.04)",
                                              p: 2,
                                              borderRadius: 2,
                                              height: "100%",
                                              transition:
                                                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                                              "&:hover": {
                                                transform: "translateY(-2px)",
                                                boxShadow:
                                                  "0 4px 12px rgba(63, 81, 181, 0.15)",
                                                bgcolor:
                                                  "rgba(63, 81, 181, 0.06)",
                                              },
                                            }}
                                          >
                                            <Box>
                                              <Typography
                                                variant="body1"
                                                sx={{
                                                  fontWeight: 600,
                                                  color: "#1a237e",
                                                  fontSize: "0.95rem",
                                                }}
                                              >
                                                {topicData.topic}
                                              </Typography>
                                            </Box>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              onClick={() => {
                                                const topicForReview = {
                                                  topic: topicData.topic,
                                                  questions:
                                                    topicData.questions,
                                                  count: topicData.count,
                                                };
                                                generateReviewContent([
                                                  topicForReview,
                                                ]);
                                              }}
                                              sx={{
                                                borderRadius: 2,
                                                background:
                                                  "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
                                                boxShadow:
                                                  "0 3px 5px 2px rgba(63, 81, 181, .3)",
                                                minWidth: "100px",
                                                height: "32px",
                                                whiteSpace: "nowrap",
                                                ml: 2,
                                                "&:hover": {
                                                  background:
                                                    "linear-gradient(45deg, #303f9f 30%, #5c6bc0 90%)",
                                                },
                                              }}
                                            >
                                              Study Now
                                            </Button>
                                          </Box>
                                        </Grid>
                                      ))}
                                    </Grid>
                                  </Box>
                                )}
                              </ListItem>
                            </motion.div>
                          ))}
                        </List>
                      </Paper>
                    </motion.div>
                  </Grid>
                )}
              </Grid>

              {selectedTopic && (
                <Dialog
                  open={!!selectedTopic}
                  onClose={() => setSelectedTopic(null)}
                  maxWidth="md"
                  fullWidth
                  PaperProps={{
                    sx: {
                      borderRadius: 3,
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
                    },
                  }}
                >
                  <DialogTitle
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      background:
                        "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
                      color: "white",
                    }}
                  >
                    <EmojiEventsIcon />
                    Topic Details: {selectedTopic}
                    <IconButton
                      onClick={() => setSelectedTopic(null)}
                      sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: "white",
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </DialogTitle>
                  <DialogContent sx={{ mt: 2 }}>
                    {selectedTopic &&
                      analytics.topicQuestions.has(selectedTopic) && (
                        <List>
                          {analytics.topicQuestions
                            .get(selectedTopic)
                            .map((question, index) => (
                              <ListItem key={index}>
                                <ListItemText
                                  primary={question.question}
                                  secondary={
                                    <>
                                      <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        Answer: {question.answer}
                                      </Typography>
                                      <br />
                                      <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        Accuracy:{" "}
                                        {formatAccuracy(
                                          question.correctCount,
                                          question.totalAttempts
                                        )}
                                      </Typography>
                                    </>
                                  }
                                />
                              </ListItem>
                            ))}
                        </List>
                      )}
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={() => {
                          router.push(
                            `/practice?topic=${encodeURIComponent(
                              selectedTopic
                            )}`
                          );
                          setSelectedTopic(null);
                        }}
                        sx={{
                          background:
                            "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
                          boxShadow: "0 3px 5px 2px rgba(63, 81, 181, .3)",
                        }}
                      >
                        Practice This Topic
                      </Button>
                    </Box>
                  </DialogContent>
                </Dialog>
              )}

              {renderReviewDialog()}
              {renderExplanationDialog()}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
}
