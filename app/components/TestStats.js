"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  Chip,
} from "@mui/material";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { motion } from "framer-motion";
import TimelineIcon from "@mui/icons-material/Timeline";
import { keyframes } from "@mui/system";
import { useLanguage } from "../contexts/LanguageContext";
import useTranslation from "../hooks/useTranslation";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function TestStats() {
  const { user } = useUser();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [testHistory, setTestHistory] = useState([]);
  const [stats, setStats] = useState({
    averageScore: 0,
    testsCompleted: 0,
    totalTimePracticed: 0,
  });
  const [selectedTest, setSelectedTest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadTestHistory = useCallback(async () => {
    if (!user) return;
    try {
      const testResultsRef = collection(db, "users", user.id, "testResults");
      const q = query(testResultsRef, orderBy("dateTaken", "desc"), limit(10));
      const querySnapshot = await getDocs(q);

      const history = [];
      let totalScore = 0;
      let totalTime = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const timeSpent = parseInt(data.timeSpentSeconds) || 0;
        history.push({
          id: doc.id,
          ...data,
          dateTaken: data.dateTaken?.toDate(),
          timeSpentSeconds: timeSpent,
        });
        totalScore += data.score;
        totalTime += timeSpent;
      });

      setTestHistory(history);
      setStats({
        averageScore: history.length > 0 ? totalScore / history.length : 0,
        testsCompleted: history.length,
        totalTimePracticed: totalTime,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error loading test history:", error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadTestHistory();
    }
  }, [user, loadTestHistory]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRowClick = (test) => {
    setSelectedTest(test);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTest(null);
  };

  const renderQuestionReview = (question, index) => {
    const isCorrect = question.isCorrect;
    const userAnswer = question.userAnswer;
    const correctAnswer = question.correctAnswer;

    return (
      <Paper
        key={index}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: isCorrect ? "success.light" : "error.light",
          bgcolor: isCorrect ? "success.lighter" : "error.lighter",
          position: "relative",
        }}
      >
        <Stack spacing={{ xs: 1, sm: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            {`${index + 1}. ${question.question}`}
          </Typography>

          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 500,
                mb: 0.5,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              {t("practice.yourAnswer", "Your answer:")}
            </Typography>
            <Typography
              sx={{
                color: isCorrect ? "success.dark" : "error.dark",
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontWeight: 500,
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
              }}
            >
              {isCorrect ? (
                <CheckCircleOutlineIcon
                  color="success"
                  sx={{ fontSize: { xs: 18, sm: 20 } }}
                />
              ) : (
                <ErrorOutlineIcon
                  color="error"
                  sx={{ fontSize: { xs: 18, sm: 20 } }}
                />
              )}
              {question.type === "trueFalse"
                ? userAnswer
                  ? t("practice.true", "True")
                  : t("practice.false", "False")
                : userAnswer || t("practice.notAnswered", "Not answered")}
            </Typography>
          </Box>

          {!isCorrect && (
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontWeight: 500,
                  mb: 0.5,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                {t("practice.correctAnswer", "Correct answer:")}
              </Typography>
              <Typography
                sx={{
                  color: "success.dark",
                  fontWeight: 500,
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                }}
              >
                {question.type === "trueFalse"
                  ? correctAnswer
                    ? t("practice.true", "True")
                    : t("practice.false", "False")
                  : correctAnswer}
              </Typography>
            </Box>
          )}

          <Chip
            label={
              question.type === "multipleChoice"
                ? t("practice.multipleChoice", "Multiple Choice")
                : question.type === "trueFalse"
                ? t("practice.trueFalse", "True/False")
                : t("practice.fillInBlank", "Fill in Blank")
            }
            size="small"
            sx={{
              alignSelf: "flex-start",
              bgcolor: "background.paper",
              borderRadius: 1,
              height: { xs: 22, sm: 24 },
              "& .MuiChip-label": {
                px: { xs: 1, sm: 1.5 },
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
              },
            }}
          />
        </Stack>
      </Paper>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          borderRadius: 4,
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
          boxShadow: "0 4px 20px rgba(63, 81, 181, 0.15)",
          overflow: "visible",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: { xs: 2, sm: 3, md: 4 },
              fontWeight: 600,
              color: "#1a237e",
              textAlign: "center",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            {t("dashboard.stats.title")}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: { xs: 2, sm: 2, md: 3 },
              mb: 4,
            }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: 3,
                  minWidth: "auto",
                  width: "100%",
                  minHeight: { xs: 120, sm: 130, md: 140 },
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #3949ab 0%, #5c6bc0 100%)",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background:
                      "radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)",
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    color: "rgba(255,255,255,0.8)",
                    height: { xs: 20, sm: 24 },
                    fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.875rem" },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    px: 1,
                  }}
                >
                  {t("dashboard.stats.averageScore")}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  }}
                >
                  {stats.averageScore.toFixed(1)}%
                </Typography>
              </Paper>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: 3,
                  minWidth: "auto",
                  width: "100%",
                  minHeight: { xs: 120, sm: 130, md: 140 },
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #5c6bc0 0%, #7986cb 100%)",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background:
                      "radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)",
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    color: "rgba(255,255,255,0.8)",
                    height: { xs: 20, sm: 24 },
                    fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.875rem" },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    px: 1,
                  }}
                >
                  {t("dashboard.stats.testsCompleted")}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  }}
                >
                  {stats.testsCompleted}
                </Typography>
              </Paper>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: 3,
                  minWidth: "auto",
                  width: "100%",
                  minHeight: { xs: 120, sm: 130, md: 140 },
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #7986cb 0%, #9fa8da 100%)",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background:
                      "radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)",
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    color: "rgba(255,255,255,0.8)",
                    height: { xs: 20, sm: 24 },
                    fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.875rem" },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    px: 1,
                  }}
                >
                  {t("dashboard.stats.timePracticed")}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                  }}
                >
                  {formatTime(stats.totalTimePracticed)}
                </Typography>
              </Paper>
            </motion.div>
          </Box>

          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 600,
              color: "#1a237e",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {t("dashboard.stats.recentHistory")}
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderRadius: 3,
              overflow: "auto",
              maxWidth: "100%",
              "& .MuiTableCell-root": {
                borderColor: "rgba(63, 81, 181, 0.1)",
                padding: { xs: "8px 12px", sm: "16px" },
              },
              "& .MuiTableRow-root": {
                cursor: "pointer",
              },
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Table sx={{ minWidth: { xs: 450, sm: 650 } }}>
              <TableHead>
                <TableRow
                  sx={{
                    background: "rgba(63, 81, 181, 0.05)",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#1a237e",
                      width: { xs: "35%", sm: "30%", md: "auto" },
                    }}
                  >
                    {t("dashboard.stats.flashcardSet", "Flashcard Set")}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#1a237e",
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  >
                    {t("dashboard.stats.date", "Date")}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#1a237e",
                      width: { xs: "25%", sm: "auto" },
                    }}
                  >
                    {t("dashboard.stats.score", "Score")}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#1a237e",
                      width: { xs: "25%", sm: "auto" },
                    }}
                  >
                    {t("dashboard.stats.questions", "Questions")}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#1a237e",
                      display: { xs: "none", md: "table-cell" },
                    }}
                  >
                    {t("dashboard.stats.time", "Time")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testHistory.length > 0 ? (
                  testHistory.map((test, index) => (
                    <TableRow
                      key={test.id}
                      hover
                      onClick={() => handleRowClick(test)}
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          backgroundColor: "rgba(63, 81, 181, 0.12) !important",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#3949ab",
                            maxWidth: { xs: 120, sm: 200 },
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "inline-flex",
                            alignItems: "center",
                            borderBottom: "2px solid transparent",
                            transition: "border-color 0.2s ease-in-out",
                            paddingBottom: "2px",
                            fontSize: { xs: "0.8rem", sm: "inherit" },
                            "tr:hover &": {
                              borderBottomColor: "#3949ab",
                            },
                          }}
                        >
                          {test.setName || "Untitled Set"}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", sm: "table-cell" } }}
                      >
                        {formatDate(test.dateTaken)}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              color:
                                test.score >= 70
                                  ? "#4caf50"
                                  : test.score >= 50
                                  ? "#ff9800"
                                  : "#f44336",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              fontSize: { xs: "0.85rem", sm: "inherit" },
                            }}
                          >
                            {test.score.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 500,
                            fontSize: { xs: "0.8rem", sm: "inherit" },
                          }}
                        >
                          {test.correctAnswers} / {test.totalQuestions}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        <Typography sx={{ color: "text.secondary" }}>
                          {formatTime(test.timeSpentSeconds)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {t(
                          "dashboard.stats.noHistory",
                          "No test history yet. Take your first test to see your progress!"
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Question Review Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            margin: { xs: 1, sm: 2, md: 3 },
            width: { xs: "calc(100% - 16px)", sm: "auto" },
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            padding: { xs: "16px 16px 8px", sm: "16px 24px 8px" },
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#1a237e",
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              {t("practice.testResults", "Test Review")}
            </Typography>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              {selectedTest?.setName} - {formatDate(selectedTest?.dateTaken)}
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            size="small"
            sx={{
              position: { xs: "absolute", sm: "static" },
              top: { xs: 8, sm: "auto" },
              right: { xs: 8, sm: "auto" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2, px: { xs: 2, sm: 3 } }}>
          {/* Test Summary */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1.5, sm: 2 },
              mb: 3,
              p: { xs: 1.5, sm: 2 },
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                {t("dashboard.stats.score", "Score")}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color:
                    selectedTest?.score >= 70
                      ? "#4caf50"
                      : selectedTest?.score >= 50
                      ? "#ff9800"
                      : "#f44336",
                  fontWeight: 600,
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                {selectedTest?.score.toFixed(1)}%
              </Typography>
            </Box>
            <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                {t("dashboard.stats.questions", "Questions")}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                {selectedTest?.correctAnswers} / {selectedTest?.totalQuestions}
              </Typography>
            </Box>
            <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                {t("dashboard.stats.time", "Time")}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                {formatTime(selectedTest?.timeSpentSeconds)}
              </Typography>
            </Box>
          </Box>

          {/* Questions List */}
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
            {selectedTest?.questionDetails?.map((question, index) =>
              renderQuestionReview(question, index)
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
