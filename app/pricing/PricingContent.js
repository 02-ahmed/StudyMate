"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useRouter } from "next/navigation";

export default function PricingContent() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/sign-up");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#3f51b5",
            fontSize: { xs: "2rem", md: "2.75rem" },
            mb: 1,
          }}
        >
          Choose Your Plan
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            color: "text.secondary",
            mb: 2,
            fontSize: { xs: "1rem", md: "1.25rem" },
          }}
        >
          Select the perfect plan for your study needs
        </Typography>
      </Box>

      <Grid container spacing={2} justifyContent="center">
        {/* Free Plan */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
              overflow: "hidden",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "5px",
                backgroundColor: "#8c79e3",
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#8c79e3", mb: 0.5 }}
              >
                Free
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="h4"
                  component="p"
                  sx={{ fontWeight: "bold" }}
                >
                  $0
                  <Typography
                    component="span"
                    variant="subtitle1"
                    sx={{ color: "text.secondary", ml: 1 }}
                  >
                    / month
                  </Typography>
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  No subscription required
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#8c79e3", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">
                    Limited AI flashcards (10 sets/month)
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#8c79e3", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">
                    1MB PDF & image uploads only
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#8c79e3", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">
                    Basic practice test questions
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#8c79e3", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">
                    Basic flashcard review
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#8c79e3", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">
                    Basic performance analytics
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CancelIcon
                    sx={{ mr: 1, color: "text.disabled", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    No advanced AI models
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CancelIcon
                    sx={{ mr: 1, color: "text.disabled", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    No study guide generation
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CancelIcon
                    sx={{ mr: 1, color: "text.disabled", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Limited content formats
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                size="medium"
                onClick={handleGetStarted}
                sx={{
                  width: "100%",
                  py: 1,
                  borderColor: "#8c79e3",
                  color: "#8c79e3",
                  "&:hover": {
                    borderColor: "#7b68d9",
                    backgroundColor: "rgba(140, 121, 227, 0.04)",
                  },
                }}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Annual Plan */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              transform: "translateY(-10px)",
              overflow: "hidden",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "5px",
                backgroundColor: "#e15fed",
              },
              border: "2px solid #e15fed",
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 12,
                right: -28,
                transform: "rotate(45deg)",
                backgroundColor: "#e15fed",
                color: "white",
                padding: "2px 30px",
                fontSize: "0.65rem",
                fontWeight: "bold",
                zIndex: 2,
              }}
            >
              BEST VALUE
            </Box>
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#e15fed", mb: 0.5 }}
              >
                Annual
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="h4"
                  component="p"
                  sx={{ fontWeight: "bold" }}
                >
                  $2.99
                  <Typography
                    component="span"
                    variant="subtitle1"
                    sx={{ color: "text.secondary", ml: 1 }}
                  >
                    / month
                  </Typography>
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Billed annually
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#e15fed", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">
                    Unlimited AI-generated flashcards
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#e15fed", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">Advanced AI models</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#e15fed", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">
                    10MB PDF, Word, PPT & image uploads
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#e15fed", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">
                    Advanced practice test questions
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#e15fed", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">
                    Advanced performance analytics
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#e15fed", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">
                    AI-powered study guides
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#e15fed", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">Priority support</Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                size="medium"
                onClick={handleGetStarted}
                sx={{
                  width: "100%",
                  py: 1,
                  backgroundColor: "#e15fed",
                  "&:hover": {
                    backgroundColor: "#c74dd1",
                  },
                }}
              >
                Subscribe
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Plan */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
              overflow: "hidden",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "5px",
                backgroundColor: "#f2994a",
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#f2994a", mb: 0.5 }}
              >
                Monthly
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="h4"
                  component="p"
                  sx={{ fontWeight: "bold" }}
                >
                  $4.99
                  <Typography
                    component="span"
                    variant="subtitle1"
                    sx={{ color: "text.secondary", ml: 1 }}
                  >
                    / month
                  </Typography>
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Billed monthly
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#f2994a", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">
                    Unlimited AI-generated flashcards
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#f2994a", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">Advanced AI models</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#f2994a", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">
                    10MB PDF, Word, PPT & image uploads
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#f2994a", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">
                    Advanced practice test questions
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#f2994a", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">
                    Advanced performance analytics
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#f2994a", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">
                    AI-powered study guides
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CheckCircleIcon
                    sx={{ mr: 1, color: "#f2994a", fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2">Priority support</Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                size="medium"
                onClick={handleGetStarted}
                sx={{
                  width: "100%",
                  py: 1,
                  backgroundColor: "#f2994a",
                  "&:hover": {
                    backgroundColor: "#e08b3d",
                  },
                }}
              >
                Subscribe
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Button
          variant="text"
          color="primary"
          size="small"
          href="mailto:contact@flashcards.com"
        >
          Need a custom plan for your school or organization? Contact Us
        </Button>
      </Box>
    </Container>
  );
}
