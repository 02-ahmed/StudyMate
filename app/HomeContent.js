"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  Card,
  CardContent,
} from "@mui/material";
import Image from "next/image";

export default function HomeContent() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return null; // Only show loading state
  }

  // Don't show the landing page content if user is signed in
  if (isSignedIn) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, textAlign: "center" }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#3f51b5",
            fontSize: { xs: "2.5rem", md: "3.75rem" },
          }}
        >
          Transform Your Study Experience
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: "text.secondary",
            mb: 4,
            maxWidth: "800px",
            mx: "auto",
          }}
        >
          Create smart flashcards, generate study notes, and track your progress
          with AI-powered learning tools.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            size="large"
            href="/generate"
            sx={{ px: 4, py: 1.5, fontSize: "1.1rem" }}
          >
            Try Generate Notes
          </Button>
          {!isSignedIn && (
            <Button
              variant="outlined"
              size="large"
              href="/sign-up"
              sx={{ px: 4, py: 1.5, fontSize: "1.1rem" }}
            >
              Sign Up Free
            </Button>
          )}
        </Box>
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ py: 8 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", textAlign: "center", p: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                AI-Powered Notes
              </Typography>
              <Typography color="text.secondary">
                Transform any text into organized study materials with our
                advanced AI technology.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", textAlign: "center", p: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                Smart Review System
              </Typography>
              <Typography color="text.secondary">
                Track your progress and review cards at the optimal time for
                better retention.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", textAlign: "center", p: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                Study Analytics
              </Typography>
              <Typography color="text.secondary">
                Get insights into your learning progress and identify areas for
                improvement.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* How It Works Section */}
      <Box sx={{ py: 8 }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: "#3f51b5",
            mb: 6,
          }}
        >
          How It Works
        </Typography>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ position: "relative", height: "300px" }}>
              <Image
                src="/images/study.jpg"
                alt="Study process"
                layout="fill"
                objectFit="cover"
                style={{ borderRadius: "8px" }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                1. Input Your Study Material
              </Typography>
              <Typography paragraph color="text.secondary">
                Simply paste your text or upload your notes.
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                2. Generate Smart Notes
              </Typography>
              <Typography paragraph color="text.secondary">
                Our AI creates organized flashcards and study materials.
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                3. Review and Learn
              </Typography>
              <Typography paragraph color="text.secondary">
                Study effectively with our smart review system.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          Ready to Transform Your Study Habits?
        </Typography>
        <Typography
          sx={{ mb: 4, maxWidth: "600px", mx: "auto", color: "text.secondary" }}
        >
          Join thousands of students who are already studying smarter, not
          harder.
        </Typography>
        <Button
          variant="contained"
          size="large"
          href="/sign-up"
          sx={{ px: 4, py: 1.5 }}
        >
          Start Learning Now
        </Button>
      </Box>
    </Container>
  );
}
