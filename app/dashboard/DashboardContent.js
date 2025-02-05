"use client";

import { useUser } from "@clerk/nextjs";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import TestStats from "../components/TestStats";
import PerformanceAnalytics from "../components/PerformanceAnalytics";
import { motion } from "framer-motion";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import QuizIcon from "@mui/icons-material/Quiz";

export default function DashboardContent() {
  const { user } = useUser();
  const [totalNotes, setTotalNotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [weakTopics, setWeakTopics] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    createNotes: false,
    viewNotes: false,
    takeQuiz: false,
  });

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      try {
        const q = query(collection(db, "users", user.id, "flashcardSets"));
        const querySnapshot = await getDocs(q);
        setTotalNotes(querySnapshot.size);
        setLoading(false);
      } catch (error) {
        console.error("Error loading stats:", error);
        setLoading(false);
      }
    }
    loadStats();
  }, [user]);

  const handleNavigation = async (path, buttonKey) => {
    setLoadingStates((prev) => ({ ...prev, [buttonKey]: true }));
    await router.push(path);
    setLoadingStates((prev) => ({ ...prev, [buttonKey]: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 1, sm: 2 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            fontWeight: 600,
            background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Your Learning Journey
        </Typography>
      </motion.div>

      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {/* Achievement Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              borderRadius: { xs: 1.5, sm: 2 },
              boxShadow: { xs: 1, sm: 2 },
            }}
          >
            <CardContent
              sx={{
                p: { xs: 1.5, sm: 2 },
                "&:last-child": { pb: { xs: 1.5, sm: 2 } },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <EmojiEventsIcon
                  sx={{
                    fontSize: { xs: 18, sm: 20 },
                    color: "#FFD700",
                    mr: 1,
                  }}
                />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 500,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  Study Achievement
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  mt: 1,
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    color: "#3f51b5",
                    fontWeight: 600,
                    fontSize: { xs: "1.75rem", sm: "2.125rem" },
                  }}
                >
                  {totalNotes}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    ml: 1,
                    color: "text.secondary",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  Note Sets Created
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions Card */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              height: "100%",
              borderRadius: { xs: 1.5, sm: 2 },
              boxShadow: { xs: 1, sm: 2 },
            }}
          >
            <CardContent
              sx={{
                p: { xs: 1.5, sm: 2 },
                "&:last-child": { pb: { xs: 1.5, sm: 2 } },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <NoteAddIcon
                  sx={{
                    fontSize: { xs: 18, sm: 20 },
                    color: "#3f51b5",
                    mr: 1,
                  }}
                />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 500,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  Quick Actions
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 1, sm: 2 },
                  mt: 1,
                  flexWrap: "wrap",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  startIcon={!loadingStates.createNotes && <AddIcon />}
                  onClick={() => handleNavigation("/generate", "createNotes")}
                  disabled={loadingStates.createNotes}
                  sx={{
                    bgcolor: "#3f51b5",
                    textTransform: "none",
                    flex: { xs: "1 1 100%", sm: "1 1 auto" },
                    maxWidth: { xs: "100%", sm: 200 },
                    height: { xs: 36, sm: 40 },
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    position: "relative",
                  }}
                >
                  {loadingStates.createNotes ? (
                    <CircularProgress size={20} sx={{ color: "white" }} />
                  ) : (
                    "Create Notes"
                  )}
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={!loadingStates.viewNotes && <VisibilityIcon />}
                  onClick={() => handleNavigation("/notes", "viewNotes")}
                  disabled={loadingStates.viewNotes}
                  sx={{
                    textTransform: "none",
                    flex: { xs: "1 1 100%", sm: "1 1 auto" },
                    maxWidth: { xs: "100%", sm: 200 },
                    height: { xs: 36, sm: 40 },
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    position: "relative",
                  }}
                >
                  {loadingStates.viewNotes ? (
                    <CircularProgress size={20} sx={{ color: "#3f51b5" }} />
                  ) : (
                    "View Notes"
                  )}
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={!loadingStates.takeQuiz && <QuizIcon />}
                  onClick={() => handleNavigation("/practice", "takeQuiz")}
                  disabled={loadingStates.takeQuiz}
                  sx={{
                    bgcolor: "#4caf50",
                    textTransform: "none",
                    flex: { xs: "1 1 100%", sm: "1 1 auto" },
                    maxWidth: { xs: "100%", sm: 200 },
                    height: { xs: 36, sm: 40 },
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    "&:hover": {
                      bgcolor: "#388e3c",
                    },
                    position: "relative",
                  }}
                >
                  {loadingStates.takeQuiz ? (
                    <CircularProgress size={20} sx={{ color: "white" }} />
                  ) : (
                    "Take a Quiz"
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Combined Statistics Section */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: { xs: 1.5, sm: 2 },
              boxShadow: { xs: 1, sm: 2 },
            }}
          >
            <CardContent
              sx={{
                p: { xs: 1.5, sm: 2 },
                "&:last-child": { pb: { xs: 1.5, sm: 2 } },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: { xs: 2, sm: 3 },
                }}
              >
                <TestStats />
                <PerformanceAnalytics />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
