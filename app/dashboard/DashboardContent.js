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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 600,
            background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Your Learning Journey
        </Typography>
      </motion.div>

      <Grid container spacing={2}>
        {/* Top Row - Achievement and Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <EmojiEventsIcon
                  sx={{ fontSize: 20, color: "#FFD700", mr: 1 }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  Study Achievement
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "baseline", mt: 1 }}>
                <Typography
                  variant="h4"
                  sx={{ color: "#3f51b5", fontWeight: 600 }}
                >
                  {totalNotes}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ ml: 1, color: "text.secondary" }}
                >
                  Note Sets Created
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <NoteAddIcon sx={{ fontSize: 20, color: "#3f51b5", mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  Quick Actions
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => router.push("/generate")}
                  sx={{
                    bgcolor: "#3f51b5",
                    textTransform: "none",
                    flex: "1 1 auto",
                    maxWidth: 200,
                  }}
                >
                  Create Notes
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => router.push("/notes")}
                  sx={{
                    textTransform: "none",
                    flex: "1 1 auto",
                    maxWidth: 200,
                  }}
                >
                  View Notes
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<QuizIcon />}
                  onClick={() => router.push("/practice")}
                  sx={{
                    bgcolor: "#4caf50",
                    textTransform: "none",
                    flex: "1 1 auto",
                    maxWidth: 200,
                    "&:hover": {
                      bgcolor: "#388e3c",
                    },
                  }}
                >
                  Take a Quiz
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Combined Statistics Section */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
