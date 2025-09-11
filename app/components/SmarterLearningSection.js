"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";

export default function SmarterLearningSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // xs only (0-599px)
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg")); // sm, md (600-1199px)
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg")); // lg and xl (1200px+)

  const features = [
    {
      id: 1,
      title: "Intelligent Conversational Interface",
      description:
        "StudyMate can engage in natural language conversations with users, understanding their queries and providing accurate and relevant responses in real-time.",
    },
    {
      id: 2,
      title: "Progress Tracking & Feedback",
      description:
        "Tracks and analyzes user progress, providing feedback on performance, strengths, & areas needing improvement. It offers personalized recommendations for further study.",
    },
    {
      id: 3,
      title: "Adaptive Learning Algorithms:",
      description:
        "StudyMate utilizes adaptive learning algorithms to analyze user performance, identify areas of improvement, and recommend targeted resources or practice materials.",
    },
    {
      id: 4,
      title: "Study Reminders and Scheduling",
      description:
        "Sends reminders, suggests study schedules to help users stay organized and maintain a consistent learning routine. Is available round the clock 24/7.",
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: "#f8fafc",
      }}
    >
      <Container maxWidth="lg">
        {/* Desktop Layout - 2x2 grid with StudyMate logo in center */}
        {isDesktop && (
          <>
            {/* Header */}
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: "#1e293b",
                  textAlign: "left",
                  mb: 3,
                }}
              >
                Smarter Learning, Built Around You
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: "1.1rem",
                  color: "#64748b",
                  lineHeight: 1.6,
                  textAlign: "left",
                }}
              >
                Studymate personalizes your certification journey with
                bite-sized content, multilingual support, and neuro-inclusive
                tools — so you learn faster, retain more, and succeed on your
                terms.
              </Typography>
            </Box>

            {/* 2x2 Grid with StudyMate Logo in Center */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gridTemplateRows: "auto auto",
                gap: 4,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Top Left Card */}
              <Card
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#1e293b",
                      mb: 2,
                      fontSize: "1.1rem",
                    }}
                  >
                    {features[0].title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      lineHeight: 1.5,
                      fontSize: "0.95rem",
                    }}
                  >
                    {features[0].description}
                  </Typography>
                </CardContent>
              </Card>

              {/* Top Right Card */}
              <Card
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#1e293b",
                      mb: 2,
                      fontSize: "1.1rem",
                    }}
                  >
                    {features[1].title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      lineHeight: 1.5,
                      fontSize: "0.95rem",
                    }}
                  >
                    {features[1].description}
                  </Typography>
                </CardContent>
              </Card>

              {/* StudyMate Logo in Center */}
              <Box
                sx={{
                  gridColumn: "2",
                  gridRow: "1 / 3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  minHeight: "200px",
                }}
              >
                <Image
                  src="/redesign/studymate logo 1.png"
                  alt="StudyMate Logo"
                  width={120}
                  height={120}
                  style={{
                    objectFit: "contain",
                  }}
                />
              </Box>

              {/* Bottom Left Card */}
              <Card
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#1e293b",
                      mb: 2,
                      fontSize: "1.1rem",
                    }}
                  >
                    {features[2].title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      lineHeight: 1.5,
                      fontSize: "0.95rem",
                    }}
                  >
                    {features[2].description}
                  </Typography>
                </CardContent>
              </Card>

              {/* Bottom Right Card */}
              <Card
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#1e293b",
                      mb: 2,
                      fontSize: "1.1rem",
                    }}
                  >
                    {features[3].title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      lineHeight: 1.5,
                      fontSize: "0.95rem",
                    }}
                  >
                    {features[3].description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </>
        )}

        {/* Tablet Layout - 2x2 grid without logo */}
        {isTablet && (
          <>
            {/* Header */}
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#1e293b",
                  textAlign: "left",
                  mb: 3,
                }}
              >
                Smarter Learning, Built Around You
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: "1rem",
                  color: "#64748b",
                  lineHeight: 1.6,
                  textAlign: "left",
                }}
              >
                Studymate personalizes your certification journey with
                bite-sized content, multilingual support, and neuro-inclusive
                tools — so you learn faster, retain more, and succeed on your
                terms.
              </Typography>
            </Box>

            {/* 2x2 Grid without Logo */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 4,
              }}
            >
              {features.map((feature) => (
                <Card
                  key={feature.id}
                  sx={{
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#1e293b",
                        mb: 2,
                        fontSize: "1rem",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        lineHeight: 1.5,
                        fontSize: "0.9rem",
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}

        {/* Mobile Layout - Single column with centered header */}
        {isMobile && (
          <>
            {/* Header */}
            <Box sx={{ mb: 6, textAlign: "center" }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#1e293b",
                  textAlign: "center",
                  mb: 3,
                }}
              >
                Smarter learning, built around you.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: "1rem",
                  color: "#64748b",
                  lineHeight: 1.6,
                  textAlign: "center",
                }}
              >
                Studymate personalizes your certification journey with
                bite-sized content, multilingual support, and neuro-inclusive
                tools — so you learn faster, retain more, and succeed on your
                terms.
              </Typography>
            </Box>

            {/* Single Column Cards */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {features.map((feature) => (
                <Card
                  key={feature.id}
                  sx={{
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#1e293b",
                        mb: 2,
                        fontSize: "1rem",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        lineHeight: 1.5,
                        fontSize: "0.9rem",
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
