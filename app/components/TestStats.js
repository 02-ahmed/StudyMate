"use client";

import { useState, useEffect } from "react";
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

export default function TestStats() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [testHistory, setTestHistory] = useState([]);
  const [stats, setStats] = useState({
    averageScore: 0,
    testsCompleted: 0,
    totalTimePracticed: 0,
  });

  useEffect(() => {
    if (user) {
      loadTestHistory();
    }
  }, [user]);

  const loadTestHistory = async () => {
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
  };

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
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Practice Test Statistics
        </Typography>

        <Box sx={{ display: "flex", gap: 4, mb: 4 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Average Score
            </Typography>
            <Typography variant="h4" color="primary">
              {stats.averageScore.toFixed(1)}%
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Tests Completed
            </Typography>
            <Typography variant="h4" color="primary">
              {stats.testsCompleted}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Time Practiced
            </Typography>
            <Typography variant="h4" color="primary">
              {formatTime(stats.totalTimePracticed)}
            </Typography>
          </Box>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Recent Test History
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Questions</TableCell>
                <TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {testHistory.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>{formatDate(test.dateTaken)}</TableCell>
                  <TableCell>{test.score.toFixed(1)}%</TableCell>
                  <TableCell>
                    {test.correctAnswers} / {test.totalQuestions}
                  </TableCell>
                  <TableCell>{formatTime(test.timeSpentSeconds)}</TableCell>
                </TableRow>
              ))}
              {testHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No test history yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
