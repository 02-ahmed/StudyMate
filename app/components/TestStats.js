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
} from "@mui/material";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { motion } from "framer-motion";
import TimelineIcon from "@mui/icons-material/Timeline";
import { keyframes } from "@mui/system";

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function TestStats() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [testHistory, setTestHistory] = useState([]);
  const [stats, setStats] = useState({
    averageScore: 0,
    testsCompleted: 0,
    totalTimePracticed: 0,
  });

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
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <TimelineIcon
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
                background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Practice Test Statistics
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 4,
              mb: 4,
              flexWrap: "wrap",
              justifyContent: "space-around",
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  minWidth: 200,
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)",
                  color: "white",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "rgba(255,255,255,0.8)" }}
                >
                  Average Score
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  {stats.averageScore.toFixed(1)}%
                </Typography>
              </Paper>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  minWidth: 200,
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #5c6bc0 0%, #7986cb 100%)",
                  color: "white",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "rgba(255,255,255,0.8)" }}
                >
                  Tests Completed
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  {stats.testsCompleted}
                </Typography>
              </Paper>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  minWidth: 200,
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #7986cb 0%, #9fa8da 100%)",
                  color: "white",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "rgba(255,255,255,0.8)" }}
                >
                  Time Practiced
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
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
              color: "#3f51b5",
            }}
          >
            Recent Test History
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              "& .MuiTableCell-root": {
                borderColor: "rgba(63, 81, 181, 0.1)",
              },
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: "rgba(63, 81, 181, 0.05)",
                  }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Questions</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testHistory.map((test, index) => (
                  <motion.tr
                    key={test.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    component={TableRow}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(63, 81, 181, 0.05)",
                      },
                    }}
                  >
                    <TableCell>{formatDate(test.dateTaken)}</TableCell>
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
                            color: test.score >= 70 ? "#4caf50" : "#f44336",
                            fontWeight: 500,
                          }}
                        >
                          {test.score.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {test.correctAnswers} / {test.totalQuestions}
                    </TableCell>
                    <TableCell>{formatTime(test.timeSpentSeconds)}</TableCell>
                  </motion.tr>
                ))}
                {testHistory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No test history yet. Take your first test to see your
                        progress!
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
