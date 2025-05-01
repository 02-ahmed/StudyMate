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
    <Container maxWidth="lg" sx={{ pt: 10, pb: 4 }}>
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#3f51b5",
            fontSize: { xs: "1.75rem", md: "2.5rem" },
            mb: 0.5,
          }}
        >
          Choose Your Plan
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            color: "text.secondary",
            mb: 1.5,
            fontSize: { xs: "0.9rem", md: "1.1rem" },
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
                height: "4px",
                backgroundColor: "#8c79e3",
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  color: "#8c79e3",
                  mb: 0.5,
                  fontSize: "1.15rem",
                }}
              >
                Free
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="h4"
                  component="p"
                  sx={{ fontWeight: "bold", fontSize: "1.75rem" }}
                >
                  $0
                  <Typography
                    component="span"
                    variant="subtitle1"
                    sx={{ color: "text.secondary", ml: 1, fontSize: "0.8rem" }}
                  >
                    / month
                  </Typography>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                >
                  No subscription required
                </Typography>
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#8c79e3", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    Limited AI flashcards (10 sets/month)
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#8c79e3", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    1MB PDF & image uploads only
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#8c79e3", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    Basic practice test questions
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#8c79e3", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    Basic flashcard review
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#8c79e3", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    Basic performance analytics
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CancelIcon
                    sx={{
                      mr: 0.75,
                      color: "text.disabled",
                      fontSize: "0.8rem",
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                  >
                    No advanced AI models
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CancelIcon
                    sx={{
                      mr: 0.75,
                      color: "text.disabled",
                      fontSize: "0.8rem",
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                  >
                    No study guide generation
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CancelIcon
                    sx={{
                      mr: 0.75,
                      color: "text.disabled",
                      fontSize: "0.8rem",
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                  >
                    Limited content formats
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={handleGetStarted}
                sx={{
                  width: "100%",
                  py: 0.75,
                  borderColor: "#8c79e3",
                  color: "#8c79e3",
                  fontSize: "0.8rem",
                  "&:hover": {
                    borderColor: "#7b68d9",
                    backgroundColor: "rgba(140, 121, 227, 0.04)",
                  },
                }}
              >
                GET STARTED
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
              transform: "translateY(-5px)",
              overflow: "hidden",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "4px",
                backgroundColor: "#e15fed",
              },
              border: "1px solid #e15fed",
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: -25,
                transform: "rotate(45deg)",
                backgroundColor: "#e15fed",
                color: "white",
                padding: "1px 25px",
                fontSize: "0.6rem",
                fontWeight: "bold",
                zIndex: 2,
              }}
            >
              BEST VALUE
            </Box>
            <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  color: "#e15fed",
                  mb: 0.5,
                  fontSize: "1.15rem",
                }}
              >
                Annual
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="h4"
                  component="p"
                  sx={{ fontWeight: "bold", fontSize: "1.75rem" }}
                >
                  $2.99
                  <Typography
                    component="span"
                    variant="subtitle1"
                    sx={{ color: "text.secondary", ml: 1, fontSize: "0.8rem" }}
                  >
                    / month
                  </Typography>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                >
                  Billed annually
                </Typography>
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#e15fed", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    Unlimited AI-generated flashcards
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#e15fed", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    Advanced AI models
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#e15fed", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    10MB PDF, Word, PPT & image uploads
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#e15fed", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    Advanced practice test questions
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#e15fed", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    Advanced performance analytics
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#e15fed", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    AI-powered study guides
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#e15fed", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    Priority support
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                size="small"
                onClick={handleGetStarted}
                sx={{
                  width: "100%",
                  py: 0.75,
                  backgroundColor: "#e15fed",
                  fontSize: "0.8rem",
                  "&:hover": {
                    backgroundColor: "#c74dd1",
                  },
                }}
              >
                SUBSCRIBE
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
                height: "4px",
                backgroundColor: "#f2994a",
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  color: "#f2994a",
                  mb: 0.5,
                  fontSize: "1.15rem",
                }}
              >
                Monthly
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="h4"
                  component="p"
                  sx={{ fontWeight: "bold", fontSize: "1.75rem" }}
                >
                  $4.99
                  <Typography
                    component="span"
                    variant="subtitle1"
                    sx={{ color: "text.secondary", ml: 1, fontSize: "0.8rem" }}
                  >
                    / month
                  </Typography>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                >
                  Billed monthly
                </Typography>
              </Box>

              <Box sx={{ mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#f2994a", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    Unlimited AI-generated flashcards
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#f2994a", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    Advanced AI models
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#f2994a", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    10MB PDF, Word, PPT & image uploads
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#f2994a", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    Advanced practice test questions
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#f2994a", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    Advanced performance analytics
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#f2994a", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    AI-powered study guides
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.75 }}>
                  <CheckCircleIcon
                    sx={{ mr: 0.75, color: "#f2994a", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                    Priority support
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                size="small"
                onClick={handleGetStarted}
                sx={{
                  width: "100%",
                  py: 0.75,
                  backgroundColor: "#f2994a",
                  fontSize: "0.8rem",
                  "&:hover": {
                    backgroundColor: "#e08b3d",
                  },
                }}
              >
                SUBSCRIBE
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
          href="mailto:gifty@techloft.org"
          sx={{ fontSize: "0.8rem" }}
        >
          Need a custom plan for your school or organization? Contact Us
        </Button>
      </Box>
    </Container>
  );
}
