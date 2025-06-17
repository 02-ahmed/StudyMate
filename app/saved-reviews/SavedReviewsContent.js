"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Button,
  Alert,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import { db } from "../../utils/firebase";
import {
  collection,
  query,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import DeleteIcon from "@mui/icons-material/Delete";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useRouter } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import useTranslation from "../hooks/useTranslation";

export default function SavedReviewsContent() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const { language } = useLanguage();
  const { t } = useTranslation();

  const loadSavedReviews = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const reviewsRef = collection(db, "users", user.id, "savedReviews");
      const reviewsSnap = await getDocs(reviewsRef);

      const reviewsData = reviewsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));

      // First sort by date
      const sortedReviews = reviewsData.sort(
        (a, b) => b.createdAt - a.createdAt
      );

      // Then fetch tags for each review
      const reviewsWithTags = [];
      for (const review of sortedReviews) {
        let setId = null;

        // Try to extract setId from the review topics
        if (review.topics && review.topics.length > 0) {
          const topic = review.topics[0];
          if (typeof topic === "object") {
            if (topic.setId) {
              setId = topic.setId;
            } else if (
              topic.topic &&
              typeof topic.topic === "object" &&
              topic.topic.setId
            ) {
              setId = topic.topic.setId;
            }
          }
        }

        // If we found a setId, try to fetch the flashcard set to get its tags
        if (setId) {
          try {
            const flashcardSetRef = doc(
              db,
              "users",
              user.id,
              "flashcardSets",
              setId
            );
            const flashcardSetSnap = await getDoc(flashcardSetRef);

            if (flashcardSetSnap.exists()) {
              const flashcardSetData = flashcardSetSnap.data();
              if (
                flashcardSetData.tags &&
                Array.isArray(flashcardSetData.tags)
              ) {
                // Add tags to the review object
                review.fetchedTags = flashcardSetData.tags;
              }
            }
          } catch (error) {
            console.error(`Error fetching tags for set ${setId}:`, error);
          }
        }

        reviewsWithTags.push(review);
      }

      setReviews(reviewsWithTags);
    } catch (error) {
      console.error("Error loading saved reviews:", error);
      setError("Failed to load saved reviews");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSavedReviews();
    }
  }, [user, loadSavedReviews]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      setDeletingReviewId(reviewId);
      const reviewRef = doc(db, "users", user.id, "savedReviews", reviewId);
      await deleteDoc(reviewRef);
      setReviews(reviews.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again.");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleViewReview = (review) => {
    // Format topics properly for the URL
    const formattedTopics = (review.topics || [review.topic] || []).map(
      (topic) => {
        if (typeof topic === "string") {
          // If topic is a string, create a simple object with just the topic property
          return { topic };
        } else if (topic && typeof topic === "object") {
          // Start with a clean object that has only the properties we need
          const cleanTopic = {};

          // Add topic name (required)
          if (topic.topic) {
            cleanTopic.topic = topic.topic;
          } else if (topic.name) {
            cleanTopic.topic = topic.name;
          } else {
            cleanTopic.topic = "Unknown Topic";
          }

          // Only add these specific properties if they exist
          if (topic.language) cleanTopic.language = topic.language;
          if (topic.setId) cleanTopic.setId = topic.setId;
          if (topic.tags && Array.isArray(topic.tags))
            cleanTopic.tags = topic.tags;

          return cleanTopic;
        }

        // Fallback case for any other formats
        return { topic: "Unknown Topic" };
      }
    );

    router.push(
      `/review?topics=${encodeURIComponent(JSON.stringify(formattedTopics))}`
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("savedReviews")}
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", mt: 1, color: "text.secondary" }}
          >
            {t("accessSavedGuides")}
          </Typography>
        </Box>

        {reviews.length === 0 ? (
          <Card sx={{ borderRadius: 2, textAlign: "center", py: 4 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                No saved reviews yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Your saved reviews will appear here
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {reviews.map((review) => (
              <Grid item xs={12} key={review.id}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <SchoolIcon color="primary" />
                          <Typography
                            variant="h6"
                            sx={{
                              fontSize: {
                                xs: "0.95rem",
                                sm: "1.1rem",
                                md: "1.25rem",
                              },
                              lineHeight: 1.2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {(() => {
                              // Get the first topic to display as title
                              const topics =
                                review.topics || [review.topic] || [];
                              if (topics.length === 0) return t("reviewGuide");

                              const firstTopic = topics[0];

                              // Handle string topics directly
                              if (typeof firstTopic === "string")
                                return firstTopic;

                              // Handle object topics (regular case)
                              if (
                                firstTopic &&
                                typeof firstTopic === "object"
                              ) {
                                // Check for nested topic object (from performance analytics)
                                if (
                                  firstTopic.topic &&
                                  typeof firstTopic.topic === "object"
                                ) {
                                  return (
                                    firstTopic.topic.name ||
                                    firstTopic.name ||
                                    t("reviewGuide")
                                  );
                                } else {
                                  return (
                                    firstTopic.topic ||
                                    firstTopic.name ||
                                    t("reviewGuide")
                                  );
                                }
                              }

                              return t("reviewGuide");
                            })()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {(() => {
                            // Extract all tags from all topics
                            const topicsArray =
                              review.topics || [review.topic] || [];
                            let allTags = [];

                            // Collect all tags from all topics
                            topicsArray.forEach((topic) => {
                              if (
                                typeof topic === "object" &&
                                topic.tags &&
                                Array.isArray(topic.tags)
                              ) {
                                allTags = [...allTags, ...topic.tags];
                              }
                            });

                            // Include fetched tags from the flashcard set
                            if (
                              review.fetchedTags &&
                              Array.isArray(review.fetchedTags)
                            ) {
                              allTags = [...allTags, ...review.fetchedTags];
                            }

                            // Remove duplicates
                            const uniqueTags = [...new Set(allTags)];

                            // If we have tags, display them
                            if (uniqueTags.length > 0) {
                              return uniqueTags.map((tag, index) => (
                                <Chip
                                  key={`tag-${index}`}
                                  label={tag}
                                  color="default"
                                  variant="outlined"
                                  size="small"
                                />
                              ));
                            }

                            // If no tags, return null (show nothing)
                            return null;
                          })()}
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title={t("viewReview")}>
                          <IconButton
                            onClick={() => handleViewReview(review)}
                            sx={{
                              color: "primary.main",
                              backgroundColor: "rgba(63, 81, 181, 0.08)",
                              "&:hover": {
                                backgroundColor: "rgba(63, 81, 181, 0.15)",
                              },
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deletingReviewId === review.id}
                          sx={{
                            color: "error.main",
                          }}
                        >
                          {deletingReviewId === review.id ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 1 }}
                    >
                      {t("created")}: {review.createdAt?.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </motion.div>
    </Container>
  );
}
