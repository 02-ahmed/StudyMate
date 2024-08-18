"use client";
import getStripe from "../utils/get-stripe";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  AppBar,
  Box,
  Button,
  Grid,
  Toolbar,
  Typography,
  Card,
  CardContent,
  Container,
} from "@mui/material";
import Image from "next/image"; // Import Image component from Next.js

const handleSubmit = async (subscriptionType) => {
  const checkoutSession = await fetch("/api/checkout_sessions", {
    method: "POST",
    headers: { origin: "http://localhost:3000" },
    body: JSON.stringify({ subscriptionType }),
  });
  const checkoutSessionJson = await checkoutSession.json();

  const stripe = await getStripe();
  const { error } = await stripe.redirectToCheckout({
    sessionId: checkoutSessionJson.id,
  });

  if (error) {
    console.warn(error.message);
  }
};

export default function Home() {
  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#3f51b5" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            StudyMate
          </Typography>
          <SignedOut>
            <Button color="inherit" href="/sign-in">
              Login
            </Button>
            <Button color="inherit" href="/sign-up">
              Sign Up
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ my: 20 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Image Section */}
          <Grid item xs={12} md={6}>
            <Image
              src="/images/study.jpg" // Replace with the path to your image
              alt="Someone studying"
              width={400}
              height={250}
              style={{ borderRadius: "8px" }}
            />
          </Grid>

          {/* Text and Buttons Section */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#3f51b5" }}
            >
              Welcome to Study Mate
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ color: "text.secondary", mb: 4 }}
            >
              The easiest way to create summary notes.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2, mr: 2, px: 4, py: 1.5 }}
              href="/generate"
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: 2, px: 4, py: 1.5 }}
              href="/learn"
            >
              Learn More
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ my: 20, px: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#3f51b5", textAlign: "center" }}
          >
            Features
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Easy Text Input
                  </Typography>
                  <Typography sx={{ color: "text.secondary", mt: 1 }}>
                    Simply paste your text whether it's just just one word or
                    your full notes and let our tool do all the work. It's that
                    easy
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    AI Powered Summaries
                  </Typography>
                  <Typography sx={{ color: "text.secondary", mt: 1 }}>
                    Our AI algorithm understands your text and generates
                    relevant study points and solutions giving you the right
                    direction to study
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Cloud Storage
                  </Typography>
                  <Typography sx={{ color: "text.secondary", mt: 1 }}>
                    Access your study cards from any device anywhere. Your study
                    summaries are always saved for easy access
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ my: 20, textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#3f51b5" }}
          >
            Pricing
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "#3f51b5" }}
                >
                  Basic
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Free
                </Typography>
                <Typography sx={{ color: "text.secondary", mt: 2 }}>
                  Access to basic services. Active by default
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 4, px: 4, py: 1.5 }}
                  onClick={() => handleSubmit("basic")}
                  disabled
                >
                  Choose Basic
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "#3f51b5" }}
                >
                  Pro
                </Typography>
                <Typography variant="h6" gutterBottom>
                  $5 / month
                </Typography>
                <Typography sx={{ color: "text.secondary", mt: 2 }}>
                  Course outline generation and study resources
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 4, px: 4, py: 1.5 }}
                  onClick={() => handleSubmit("pro")}
                >
                  Choose Pro
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}
