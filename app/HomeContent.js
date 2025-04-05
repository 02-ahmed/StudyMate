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
  CircularProgress,
} from "@mui/material";
import Image from "next/image";

export default function HomeContent() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      if (window.location.pathname !== "/dashboard") {
        router.push("/dashboard");
      }
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isSignedIn) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 6, sm: 8, md: 12 },
          textAlign: "center",
          minHeight: { xs: "auto", md: "80vh" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#3f51b5",
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3.75rem" },
            lineHeight: { xs: 1.2, md: 1.3 },
          }}
        >
          Transform Your Study Experience
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: "text.secondary",
            mb: { xs: 3, md: 4 },
            maxWidth: "800px",
            mx: "auto",
            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
            px: { xs: 2, sm: 0 },
          }}
        >
          Create smart flashcards, generate study notes, and track your progress
          with AI-powered learning tools.
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 2 },
            justifyContent: "center",
            flexDirection: { xs: "column", sm: "row" },
            px: { xs: 2, sm: 0 },
          }}
        >
          <Button
            variant="contained"
            size="large"
            href="/generate"
            sx={{
              px: { xs: 3, sm: 4 },
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: "1rem", sm: "1.1rem" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Try Generate Notes
          </Button>
          {!isSignedIn && (
            <Button
              variant="outlined"
              size="large"
              href="/sign-up"
              sx={{
                px: { xs: 3, sm: 4 },
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: "1rem", sm: "1.1rem" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Sign Up Free
            </Button>
          )}
        </Box>
      </Box>

      {/* Features Section */}
      <Grid container spacing={{ xs: 2, sm: 4 }} sx={{ py: { xs: 6, sm: 8 } }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              textAlign: "center",
              p: { xs: 2, sm: 3 },
              boxShadow: { xs: 1, sm: 2 },
              borderRadius: { xs: 1.5, sm: 2 },
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              >
                AI-Powered Notes
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Transform any text into organized study materials with our
                advanced AI technology.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              textAlign: "center",
              p: { xs: 2, sm: 3 },
              boxShadow: { xs: 1, sm: 2 },
              borderRadius: { xs: 1.5, sm: 2 },
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              >
                Smart Review System
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Track your progress and review cards at the optimal time for
                better retention.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              textAlign: "center",
              p: { xs: 2, sm: 3 },
              boxShadow: { xs: 1, sm: 2 },
              borderRadius: { xs: 1.5, sm: 2 },
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              >
                Study Analytics
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Get insights into your learning progress and identify areas for
                improvement.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* How It Works Section */}
      <Box sx={{ py: { xs: 6, sm: 8 } }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: "#3f51b5",
            mb: { xs: 4, sm: 6 },
            fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" },
          }}
        >
          How It Works
        </Typography>
        <Grid container spacing={{ xs: 3, sm: 6 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: "relative",
                height: { xs: "200px", sm: "300px" },
                borderRadius: { xs: 1.5, sm: 2 },
                overflow: "hidden",
              }}
            >
              <Image
                src="/images/study.jpg"
                alt="Study process"
                layout="fill"
                objectFit="cover"
                priority
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ px: { xs: 1, sm: 0 } }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                1. Input Your Study Material
              </Typography>
              <Typography
                paragraph
                color="text.secondary"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Simply paste your text or upload your notes.
              </Typography>

              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                2. Generate Smart Notes
              </Typography>
              <Typography
                paragraph
                color="text.secondary"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Our AI creates organized flashcards and study materials.
              </Typography>

              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                3. Review and Learn
              </Typography>
              <Typography
                paragraph
                color="text.secondary"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Study effectively with our smart review system.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 6, sm: 8 },
          textAlign: "center",
          px: { xs: 2, sm: 0 },
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: "bold",
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
          }}
        >
          Ready to Transform Your Study Habits?
        </Typography>
        <Typography
          sx={{
            mb: { xs: 3, sm: 4 },
            maxWidth: "600px",
            mx: "auto",
            color: "text.secondary",
            fontSize: { xs: "0.875rem", sm: "1rem" },
          }}
        >
          Join thousands of students who are already studying smarter, not
          harder.
        </Typography>
        <Button
          variant="contained"
          size="large"
          href="/sign-up"
          sx={{
            px: { xs: 3, sm: 4 },
            py: { xs: 1.25, sm: 1.5 },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Start Learning Now
        </Button>
      </Box>
    </Container>
  );
}
