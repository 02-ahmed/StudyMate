"use client";
import {
  AppBar,
  Box,
  Button,
  Container,
  Grid,
  Toolbar,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function LearnMore() {
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

      <Container maxWidth="lg" sx={{ my: 8 }}>
        {/* Introduction Section */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#3f51b5", textAlign: "center" }}
          >
            Learn More About StudyMate
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ color: "text.secondary", textAlign: "center", mb: 4 }}
          >
            Discover the easiest way to create, organize, and review your study
            notes.
          </Typography>
        </Box>

        {/* Image and Overview Section */}
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Image
              src="/images/group.png" // Replace with your own image path
              alt="Study group"
              width={400}
              height={250}
              style={{ borderRadius: "8px" }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#3f51b5" }}
            >
              Why Choose Study Mate?
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 4 }}>
              Study Mate is your all-in-one tool for creating flashcards,
              summary notes, and organizing your study materials. Whether you're
              preparing for exams, working on projects, or just keeping up with
              your courses, Study Mate offers an intuitive interface to help you
              stay on top of your learning.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ px: 4, py: 1.5 }}
              href="/generate"
            >
              Get Started
            </Button>
          </Grid>
        </Grid>

        {/* Features Section */}
        <Box sx={{ my: 20 }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#3f51b5", textAlign: "center" }}
          >
            Key Features
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: "100%" }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#3f51b5" }}
                  >
                    Easy Note Creation
                  </Typography>
                  <Typography sx={{ color: "text.secondary", mt: 1 }}>
                    Quickly create summary notes and flashcards with a
                    user-friendly interface that minimizes the time spent on
                    organizing materials.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: "100%" }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#3f51b5" }}
                  >
                    Organized Study Materials
                  </Typography>
                  <Typography sx={{ color: "text.secondary", mt: 1 }}>
                    Keep all your study materials in one place, easily
                    accessible and well-organized to make your study sessions
                    more efficient.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: "100%" }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#3f51b5" }}
                  >
                    Track Your Progress
                  </Typography>
                  <Typography sx={{ color: "text.secondary", mt: 1 }}>
                    Monitor your learning progress with built-in tools that help
                    you stay motivated and on track with your studies.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Benefits Section */}
        <Box sx={{ my: 20 }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#3f51b5", textAlign: "center" }}
          >
            Benefits of Using StudyMate
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#3f51b5" }}
              >
                Improve Your Retention
              </Typography>
              <Typography sx={{ color: "text.secondary", mb: 4 }}>
                Studies show that organizing and reviewing your notes helps
                improve retention and understanding of the material. Study Mate
                makes this process seamless and efficient.
              </Typography>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#3f51b5" }}
              >
                Study Anywhere, Anytime
              </Typography>
              <Typography sx={{ color: "text.secondary", mb: 4 }}>
                With cloud-based access, you can study from any device, wherever
                you are. Never miss a study session because you don’t have your
                materials with you.
              </Typography>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#3f51b5" }}
              >
                Tailored to Your Needs
              </Typography>
              <Typography sx={{ color: "text.secondary", mb: 4 }}>
                Customize your study experience with features that adapt to your
                learning style. Whether you prefer flashcards, notes, or a
                combination of both, Study Mate has you covered.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Image
                src="/images/happy.jpg" // Replace with your own image path
                alt="Benefits of studying"
                width={400}
                height={250}
                style={{ borderRadius: "8px" }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Call to Action Section */}
        <Box sx={{ my: 6, textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#3f51b5" }}
          >
            Ready to Get Started?
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ color: "text.secondary", mb: 4 }}
          >
            Sign up now and take your study game to the next level with
            StudyMate!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ px: 4, py: 1.5 }}
            href="/sign-up"
          >
            Sign Up Now
          </Button>
        </Box>
      </Container>
    </>
  );
}
