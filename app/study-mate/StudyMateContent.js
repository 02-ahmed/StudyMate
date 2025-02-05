"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useRouter } from "next/navigation";

export default function StudyMateContent() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [weakTopics, setWeakTopics] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (user) {
      loadStudyData();
    }
  }, [user]);

  const loadStudyData = async () => {
    try {
      // Load weak topics from test results
      const testResultsRef = collection(db, "users", user.id, "testResults");
      const testSnapshot = await getDocs(testResultsRef);

      const topicPerformance = new Map();

      testSnapshot.forEach((doc) => {
        const testData = doc.data();
        testData.questionDetails?.forEach((detail) => {
          detail.tags?.forEach((tag) => {
            if (!topicPerformance.has(tag)) {
              topicPerformance.set(tag, { correct: 0, total: 0 });
            }
            const stats = topicPerformance.get(tag);
            stats.total++;
            if (detail.isCorrect) stats.correct++;
          });
        });
      });

      const weakTopicsList = Array.from(topicPerformance.entries())
        .map(([topic, stats]) => ({
          topic,
          accuracy: (stats.correct / stats.total) * 100,
        }))
        .filter((topic) => topic.accuracy < 70)
        .sort((a, b) => a.accuracy - b.accuracy);

      setWeakTopics(weakTopicsList);
      setLoading(false);
    } catch (error) {
      console.error("Error loading study data:", error);
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
            }}
          >
            My Study Mate
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", mt: 1, color: "text.secondary" }}
          >
            Your personalized learning companion
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Topics to Review */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <LocalLibraryIcon
                      sx={{
                        fontSize: 40,
                        color: "#3f51b5",
                        filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))",
                        mr: 2,
                      }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Topics to Review
                    </Typography>
                  </Box>

                  {weakTopics.length > 0 ? (
                    weakTopics.map((topic, index) => (
                      <motion.div
                        key={topic.topic}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            mb: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            bgcolor: "white",
                            borderRadius: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 500 }}
                            >
                              {topic.topic}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Accuracy: {topic.accuracy.toFixed(1)}%
                            </Typography>
                          </Box>
                          <Button
                            variant="contained"
                            onClick={() =>
                              router.push(
                                `/study-mate/review?topics=${encodeURIComponent(
                                  JSON.stringify([topic.topic])
                                )}`
                              )
                            }
                            sx={{
                              background:
                                "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
                              boxShadow: "0 3px 5px 2px rgba(63, 81, 181, .3)",
                              borderRadius: 2,
                            }}
                          >
                            Study Now
                          </Button>
                        </Paper>
                      </motion.div>
                    ))
                  ) : (
                    <Typography
                      color="text.secondary"
                      sx={{ textAlign: "center" }}
                    >
                      No topics need review at the moment
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Learning Stats */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <TrendingUpIcon
                      sx={{
                        fontSize: 40,
                        color: "#3f51b5",
                        filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))",
                        mr: 2,
                      }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Learning Progress
                    </Typography>
                  </Box>

                  {/* Add learning stats and progress charts here */}
                  <Typography
                    variant="body1"
                    sx={{ textAlign: "center", mt: 2 }}
                  >
                    Learning statistics coming soon!
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
}
