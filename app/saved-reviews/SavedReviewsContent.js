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
} from "@mui/material";
import { motion } from "framer-motion";
import { db } from "../../utils/firebase";
import { collection, query, getDocs, deleteDoc, doc } from "firebase/firestore";
import DeleteIcon from "@mui/icons-material/Delete";
import SchoolIcon from "@mui/icons-material/School";
import { useRouter } from "next/navigation";

export default function SavedReviewsContent() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);

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

      setReviews(reviewsData.sort((a, b) => b.createdAt - a.createdAt));
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
    try {
      const reviewRef = doc(db, "users", user.id, "savedReviews", reviewId);
      await deleteDoc(reviewRef);
      setReviews(reviews.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleViewReview = (review) => {
    router.push(
      `/review?topics=${encodeURIComponent(
        JSON.stringify(review.topics.map((topic) => ({ topic })))
      )}`
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
            Saved Reviews
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", mt: 1, color: "text.secondary" }}
          >
            Access your saved study guides
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
                          <Typography variant="h6">Review Guide</Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {review.topics.map((topic, index) => (
                            <Chip
                              key={index}
                              label={topic}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          onClick={() => handleViewReview(review)}
                          sx={{
                            background:
                              "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
                            boxShadow: "0 3px 5px 2px rgba(63, 81, 181, .3)",
                          }}
                        >
                          View Review
                        </Button>
                        <IconButton
                          onClick={() => handleDeleteReview(review.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Created: {review.createdAt?.toLocaleDateString()}
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
