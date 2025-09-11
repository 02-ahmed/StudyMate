"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";

export default function LearningAdvantageSection() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const features = [
    {
      id: 1,
      title: "Interactive Flashcards",
      description:
        "Master key concepts and boost retention with our interactive flashcards feature.",
      image: "/redesign/interactiveflashcards.jpg",
      link: "/flashcards",
    },
    {
      id: 2,
      title: "Question Bank (S-Bank)",
      description:
        "Get access to 5+ years of past certification exam questions, organized & searchable by topic to help you practice.",
      image: "/redesign/questionbank.png",
      link: "/question-vault",
    },
    {
      id: 3,
      title: "Localized Learning",
      description:
        "Study in 4 international and 6 African languages making content accessible & culturally relevant.",
      image: "/redesign/localisedlearning.png",
      link: "/localized-learning",
    },
    {
      id: 4,
      title: "Audio Learning Mode",
      description:
        "Learn hands-free with narrated lessons in multiple languages — perfect for on-the-go revision & neurodiverse learners.",
      image: "/redesign/audiolearning.png",
      link: "/audio-learning",
    },
    {
      id: 5,
      title: "Personalized Progress Tracker",
      description:
        "Set goals, monitor your study time, and receive reminders and nudges to stay consistent and exam-ready.",
      image: "/redesign/personalisedprogress.png",
      link: "/progress-tracker",
    },
    {
      id: 6,
      title: "Neurodiverse-Friendly Design",
      description:
        "Built-in features to support learners with ADHD, dyslexia, & ASD — combining visual cues, repetition, & flexible formats.",
      image: "/redesign/neurodiverse-explained.png",
      link: "/neurodiverse-features",
    },
  ];

  // For tablet/mobile, only show first 3 features
  const displayFeatures = isDesktop ? features : features.slice(0, 3);

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: "white",
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              fontWeight: 700,
              color: "#1F2937",
              mb: 2,
            }}
          >
            Your Learning Advantage
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
              color: "#6B7280",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            study better, retain more, and pass your certifications with
            confidence.
          </Typography>
        </Box>

        {/* Features Grid */}
        {isDesktop ? (
          // Desktop: 3x2 Grid Layout
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {displayFeatures.map((feature) => (
              <Grid item xs={12} md={4} key={feature.id}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      height: { xs: 200, md: 180 },
                      borderRadius: "12px 12px 0 0",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#1F2937",
                        mb: 1,
                        fontSize: "1.1rem",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#6B7280",
                        mb: 2,
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>
                    <Typography
                      component="a"
                      href={feature.link}
                      sx={{
                        color: "#3B82F6",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Learn More
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          // Tablet/Mobile: Single Column Layout
          <Box sx={{ mb: 6 }}>
            {displayFeatures.map((feature) => (
              <Card
                key={feature.id}
                sx={{
                  mb: 4,
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  {/* Image */}
                  <Box
                    sx={{
                      position: "relative",
                      width: { xs: "100%", sm: "40%" },
                      height: { xs: 200, sm: 180 },
                      borderRadius: {
                        xs: "12px 12px 0 0",
                        sm: "12px 0 0 12px",
                      },
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#1F2937",
                        mb: 1,
                        fontSize: "1.2rem",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#6B7280",
                        mb: 2,
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>
                    <Typography
                      component="a"
                      href={feature.link}
                      sx={{
                        color: "#3B82F6",
                        textDecoration: "none",
                        fontSize: "1rem",
                        fontWeight: 500,
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      More
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}

        {/* View All Button - Only show on tablet and mobile */}
        <Box
          sx={{
            textAlign: "center",
            display: { xs: "block", sm: "block", md: "block", lg: "none" }, // Hide on desktop (lg+)
          }}
        >
          <Button
            variant="contained"
            sx={{
              px: 4,
              py: 2,
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: "8px",
              backgroundColor: "#60A5FA",
              color: "white",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#3B82F6",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
              },
              transition: "all 0.3s ease",
            }}
          >
            View All
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
