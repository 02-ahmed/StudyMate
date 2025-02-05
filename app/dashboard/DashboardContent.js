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
import { keyframes } from "@mui/system";

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px #3f51b5; }
  50% { box-shadow: 0 0 20px #3f51b5; }
  100% { box-shadow: 0 0 5px #3f51b5; }
`;

export default function DashboardContent() {
  const { user } = useUser();
  const [totalNotes, setTotalNotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: "bold",
            background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
          }}
        >
          Your Learning Journey
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card
              sx={{
                height: "100%",
                bgcolor: "background.paper",
                borderRadius: 4,
                position: "relative",
                overflow: "visible",
                "&:hover": {
                  animation: `${glowAnimation} 2s infinite`,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <EmojiEventsIcon
                    sx={{
                      fontSize: 40,
                      color: "#FFD700",
                      filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))",
                      mr: 2,
                    }}
                  />
                  <Typography variant="h5" component="div">
                    Study Achievement
                  </Typography>
                </Box>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                >
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{
                      mb: 2,
                      textAlign: "center",
                      color: "#3f51b5",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {totalNotes}
                  </Typography>
                </motion.div>
                <Typography
                  color="text.secondary"
                  sx={{
                    textAlign: "center",
                    fontSize: "1.1rem",
                    fontWeight: 500,
                  }}
                >
                  Note Sets Created
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card
              sx={{
                height: "100%",
                bgcolor: "background.paper",
                borderRadius: 4,
                background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <NoteAddIcon
                    sx={{
                      fontSize: 40,
                      color: "#3f51b5",
                      filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))",
                      mr: 2,
                    }}
                  />
                  <Typography variant="h5" component="div">
                    Quick Actions
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <motion.div whileHover={{ scale: 1.03 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => router.push("/generate")}
                        sx={{
                          mb: 2,
                          background:
                            "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
                          boxShadow: "0 3px 5px 2px rgba(63, 81, 181, .3)",
                          borderRadius: 3,
                          height: "60px",
                        }}
                      >
                        Create New Notes
                      </Button>
                    </motion.div>
                  </Grid>
                  <Grid item xs={12}>
                    <motion.div whileHover={{ scale: 1.03 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        onClick={() => router.push("/notes")}
                        sx={{
                          mb: 2,
                          borderRadius: 3,
                          height: "60px",
                          borderWidth: "2px",
                          "&:hover": {
                            borderWidth: "2px",
                          },
                        }}
                      >
                        View My Notes
                      </Button>
                    </motion.div>
                  </Grid>
                  <Grid item xs={12}>
                    <motion.div whileHover={{ scale: 1.03 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        onClick={() => router.push("/practice")}
                        sx={{
                          borderRadius: 3,
                          height: "60px",
                          borderWidth: "2px",
                          "&:hover": {
                            borderWidth: "2px",
                          },
                        }}
                      >
                        Take Practice Test
                      </Button>
                    </motion.div>
                  </Grid>
                  <Grid item xs={12}>
                    <motion.div whileHover={{ scale: 1.03 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        onClick={() => router.push("/saved-reviews")}
                        sx={{
                          borderRadius: 3,
                          height: "60px",
                          borderWidth: "2px",
                          "&:hover": {
                            borderWidth: "2px",
                          },
                        }}
                      >
                        View Saved Reviews
                      </Button>
                    </motion.div>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <TestStats />
        </Grid>

        <Grid item xs={12}>
          <PerformanceAnalytics />
        </Grid>
      </Grid>
    </Container>
  );
}
