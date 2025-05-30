"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import { db } from "../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import VisibilityIcon from "@mui/icons-material/Visibility";
import QuizIcon from "@mui/icons-material/Quiz";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TestStats from "../components/TestStats";
import PerformanceAnalytics from "../components/PerformanceAnalytics";
import { useRouter } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import useTranslation from "../hooks/useTranslation";

export default function DashboardContent() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { t, language } = useTranslation();
  const [stats, setStats] = useState({
    totalNotes: 0,
    averageScore: 0,
    totalFlashcards: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    createNotes: false,
    viewNotes: false,
    takeQuiz: false,
  });

  // New effect to log all flashcard sets
  useEffect(() => {
    const logFlashcardSets = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          const flashcardSetsRef = collection(
            db,
            "users",
            user.id,
            "flashcardSets"
          );
          const snapshot = await getDocs(flashcardSetsRef);

          if (snapshot.empty) {
          } else {
            snapshot.forEach((docSnap, index) => {
              const data = docSnap.data();
              if (data.flashcards && data.flashcards.length > 0) {
              }
            });
          }
        } catch (error) {
          console.error("Error logging flashcard sets:", error);
          console.error("Error details:", error.message);
          console.error("Error stack:", error.stack);
        }
      }
    };

    logFlashcardSets();
  }, [isLoaded, isSignedIn, user]);

  async function loadStats() {
    try {
      if (user) {
        setLoading(true);
        // Get total number of note sets
        const flashcardSetsRef = collection(
          db,
          "users",
          user.id,
          "flashcardSets"
        );
        const snapshot = await getDocs(flashcardSetsRef);
        const totalNotes = snapshot.size;

        setStats({
          totalNotes,
          averageScore: 0,
          totalFlashcards: 0,
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleNavigation = async (path, buttonKey) => {
    setLoadingStates((prev) => ({ ...prev, [buttonKey]: true }));
    router.push(path);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          color: "#4355B9",
          fontWeight: "500",
          mb: 2,
          fontSize: "1.5rem",
        }}
      >
        {t("nav.learningJourney")}
      </Typography>

      <Grid container spacing={2}>
        {/* Study Achievement Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <EmojiEventsIcon
                  sx={{ color: "#FFD700", mr: 1, fontSize: "1.2rem" }}
                />
                <Typography
                  variant="subtitle1"
                  component="h2"
                  sx={{
                    height: 28, // Fixed height for title
                    display: "flex",
                    alignItems: "center",
                    fontSize: { xs: "0.9rem", md: "1rem" }, // Smaller font on mobile/tablets
                  }}
                >
                  {t("titles.studyAchievement")}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  height: 40, // Fixed height for content
                }}
              >
                <Typography
                  variant="h4"
                  component="p"
                  sx={{ color: "#4355B9", fontWeight: "bold", mr: 1 }}
                >
                  {stats.totalNotes}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    maxWidth: "70%", // Limit width to prevent pushing layout
                    fontSize: { xs: "0.75rem", md: "0.875rem" }, // Smaller font on mobile/tablets
                    whiteSpace: "nowrap", // Prevent text from wrapping
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t("messages.noteSetsCreated")}
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
              borderRadius: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Typography variant="subtitle1" component="h2" sx={{ mb: 1 }}>
                {t("titles.quickActions")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<LibraryBooksIcon />}
                    onClick={() =>
                      handleNavigation("/flashcards", "createNotes")
                    }
                    disabled={loadingStates.createNotes}
                    sx={{
                      py: 1,
                      height: { xs: 40, sm: 48 },
                      bgcolor: "#4355B9",
                      "&:hover": { bgcolor: "#3644A0" },
                      "& .MuiButton-startIcon": {
                        marginRight: { xs: 0.5, sm: 1 },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        fontSize: {
                          xs: "0.7rem",
                          sm: "0.825rem",
                          md: "0.875rem",
                        },
                        textTransform: "uppercase",
                      }}
                    >
                      {loadingStates.createNotes ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        t("buttons.createNotes")
                      )}
                    </Box>
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleNavigation("/notes", "viewNotes")}
                    disabled={loadingStates.viewNotes}
                    sx={{
                      py: 1,
                      height: { xs: 40, sm: 48 },
                      borderColor: "#4355B9",
                      color: "#4355B9",
                      "&:hover": {
                        borderColor: "#3644A0",
                        bgcolor: "rgba(67, 85, 185, 0.08)",
                      },
                      "& .MuiButton-startIcon": {
                        marginRight: { xs: 0.5, sm: 1 },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        fontSize: {
                          xs: "0.7rem",
                          sm: "0.825rem",
                          md: "0.875rem",
                        },
                        textTransform: "uppercase",
                      }}
                    >
                      {loadingStates.viewNotes ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        t("buttons.viewNotes")
                      )}
                    </Box>
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<QuizIcon />}
                    onClick={() => handleNavigation("/practice", "takeQuiz")}
                    disabled={loadingStates.takeQuiz}
                    sx={{
                      py: 1,
                      height: { xs: 40, sm: 48 },
                      bgcolor: "#4CAF50",
                      "&:hover": { bgcolor: "#388E3C" },
                      "& .MuiButton-startIcon": {
                        marginRight: { xs: 0.5, sm: 1 },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        fontSize: {
                          xs: "0.7rem",
                          sm: "0.825rem",
                          md: "0.875rem",
                        },
                        textTransform: "uppercase",
                      }}
                    >
                      {loadingStates.takeQuiz ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        t("buttons.takeQuiz")
                      )}
                    </Box>
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Learning Journey Section */}
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
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Study Achievement Section */}
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
                <PerformanceAnalytics />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
