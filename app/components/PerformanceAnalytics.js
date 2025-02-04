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
} from "@mui/material";
import { collection, query, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useRouter } from "next/navigation";

export default function PerformanceAnalytics() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
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

        // Get flashcard set details
        const setRef = doc(
          db,
          "users",
          user.id,
          "flashcardSets",
          testData.flashcardSetId
        );
        const setSnap = await getDoc(setRef);
        const setData = setSnap.exists() ? setSnap.data() : null;
        const tags = setData?.tags || [];

        // Process questions
        testData.questionDetails.forEach((detail) => {
          // Update question type stats
          const typeStats = questionTypeStats[detail.type];
          if (typeStats) {
            typeStats.total++;
            if (detail.isCorrect) typeStats.correct++;
          }

          // Track questions by topic
          tags.forEach((tag) => {
            if (!topicQuestions.has(tag)) {
              topicQuestions.set(tag, []);
            }
            const questions = topicQuestions.get(tag);
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
          });

          // Track missed questions
          if (!detail.isCorrect) {
            const key = `${detail.question}|${detail.correctAnswer}`;
            const current = missedQuestions.get(key) || {
              question: detail.question,
              answer: detail.correctAnswer,
              count: 0,
              type: detail.type,
              tags,
            };
            current.count++;
            missedQuestions.set(key, current);

            tags.forEach((tag) => {
              const tagStats = topicPerformance.get(tag) || {
                correct: 0,
                total: 0,
              };
              tagStats.total++;
              topicPerformance.set(tag, tagStats);
            });
          } else {
            tags.forEach((tag) => {
              const tagStats = topicPerformance.get(tag) || {
                correct: 0,
                total: 0,
              };
              tagStats.total++;
              tagStats.correct++;
              topicPerformance.set(tag, tagStats);
            });
          }
        });
      }

      // Calculate weak topics
      const weakTopics = Array.from(topicPerformance.entries())
        .map(([topic, stats]) => ({
          topic,
          accuracy: (stats.correct / stats.total) * 100,
          questions: topicQuestions.get(topic) || [],
        }))
        .filter((topic) => topic.accuracy < 70)
        .sort((a, b) => a.accuracy - b.accuracy);

      // Get frequently missed questions
      const frequentlyMissed = Array.from(missedQuestions.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Generate enhanced recommendations
      const recommendations = [];

      // Topic-based recommendations
      if (weakTopics.length > 0) {
        recommendations.push({
          type: "topic",
          message: `Focus on reviewing ${
            weakTopics[0].topic
          } (${weakTopics[0].accuracy.toFixed(1)}% accuracy)`,
          priority: 1,
          action: () => setSelectedTopic(weakTopics[0].topic),
        });
      }

      // Question-based recommendations
      if (frequentlyMissed.length > 0) {
        recommendations.push({
          type: "card",
          message: "Review these frequently missed cards",
          cards: frequentlyMissed.slice(0, 3),
          priority: 2,
        });
      }

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
          action: () => router.push("/practice"),
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
    <>
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Performance Analysis</Typography>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Tests: {analytics.totalTestsTaken}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Score: {analytics.averageScore.toFixed(1)}%
              </Typography>
            </Box>
          </Box>

          {/* Study Streak */}
          {analytics.studyStreak > 0 && (
            <Alert severity="success" sx={{ mb: 3 }}>
              🔥 {analytics.studyStreak} Day Study Streak!
            </Alert>
          )}

          {/* Recommendations Section */}
          <Paper sx={{ mb: 3, p: 2 }} elevation={0} variant="outlined">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => toggleSection("recommendations")}
            >
              <Typography variant="subtitle1">Study Recommendations</Typography>
              {expandedSection === "recommendations" ? (
                <ExpandLessIcon />
              ) : (
                <ExpandMoreIcon />
              )}
            </Box>
            <Collapse in={expandedSection === "recommendations"}>
              {analytics.recommendations.length > 0 ? (
                <List>
                  {analytics.recommendations.map((rec, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      <ListItemText primary={rec.message} />
                      {rec.action && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={rec.action}
                          sx={{ mt: 1 }}
                        >
                          Take Action
                        </Button>
                      )}
                      {rec.type === "card" && rec.cards && (
                        <Box sx={{ mt: 1 }}>
                          {rec.cards.map((card, idx) => (
                            <Typography
                              key={idx}
                              variant="body2"
                              color="text.secondary"
                            >
                              • &ldquo;{card.question}&rdquo; (missed{" "}
                              {card.count} times)
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Take more tests to get personalized recommendations
                </Alert>
              )}
            </Collapse>
          </Paper>

          {/* Question Types Section */}
          <Paper sx={{ mb: 3, p: 2 }} elevation={0} variant="outlined">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => toggleSection("questionTypes")}
            >
              <Typography variant="subtitle1">
                Performance by Question Type
              </Typography>
              {expandedSection === "questionTypes" ? (
                <ExpandLessIcon />
              ) : (
                <ExpandMoreIcon />
              )}
            </Box>
            <Collapse in={expandedSection === "questionTypes"}>
              <Box sx={{ mt: 2 }}>
                {Object.entries(analytics.byQuestionType).map(
                  ([type, stats]) => (
                    <Box key={type} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">
                          {type.replace(/([A-Z])/g, " $1").trim()}
                        </Typography>
                        <Typography variant="body2">
                          {formatAccuracy(stats.correct, stats.total)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={
                          stats.total > 0
                            ? (stats.correct / stats.total) * 100
                            : 0
                        }
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  )
                )}
              </Box>
            </Collapse>
          </Paper>

          {/* Topics Section */}
          {analytics.weakTopics.length > 0 && (
            <Paper sx={{ mb: 3, p: 2 }} elevation={0} variant="outlined">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => toggleSection("topics")}
              >
                <Typography variant="subtitle1">Topics to Review</Typography>
                {expandedSection === "topics" ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
              </Box>
              <Collapse in={expandedSection === "topics"}>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                  {analytics.weakTopics.map((topic, index) => (
                    <Chip
                      key={index}
                      label={`${topic.topic} (${topic.accuracy.toFixed(1)}%)`}
                      color="warning"
                      onClick={() => handleTopicClick(topic.topic)}
                      sx={{ cursor: "pointer" }}
                    />
                  ))}
                </Box>
              </Collapse>
            </Paper>
          )}

          {/* Frequently Missed Questions Section */}
          {analytics.frequentlyMissed.length > 0 && (
            <Paper sx={{ p: 2 }} elevation={0} variant="outlined">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => toggleSection("missed")}
              >
                <Typography variant="subtitle1">
                  Frequently Missed Questions
                </Typography>
                {expandedSection === "missed" ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
              </Box>
              <Collapse in={expandedSection === "missed"}>
                <List>
                  {analytics.frequentlyMissed.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={item.question}
                        secondary={`Correct answer: ${item.answer} (missed ${item.count} times)`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Topic Details Dialog */}
      <Dialog
        open={Boolean(selectedTopic)}
        onClose={() => setSelectedTopic(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Topic Details: {selectedTopic}</Typography>
            <IconButton onClick={() => setSelectedTopic(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTopic && analytics.topicQuestions.has(selectedTopic) && (
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
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={() => {
                router.push("/practice");
                setSelectedTopic(null);
              }}
            >
              Practice This Topic
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
