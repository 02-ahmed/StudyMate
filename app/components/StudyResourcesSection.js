"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";

export default function StudyResourcesSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // xs only (0-599px)
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg")); // sm, md (600-1199px)
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg")); // lg and xl (1200px+)

  // Sample study resources data
  const studyResources = [
    {
      id: 1,
      title: "Foundation of Mathematics: A comprehensive Guide",
      source: "Youtube",
      exam: "SAT exams",
      status: "Pending",
      thumbnailColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: 2,
      title: "The Art of Creative Writing",
      instructor: "Dr. Lily Morgan",
      audience: "Masters in Journalism",
      status: "Ongoing",
      thumbnailColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      id: 3,
      title: "Law Entrance Exam Prep Mindset",
      instructor: "Prof. Benjamin Collins",
      institution: "Ghana Law School",
      status: "Pending",
      thumbnailColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
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
        {/* Desktop Layout - 3 cards horizontal */}
        {isDesktop && (
          <>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 700,
                color: "#1e293b",
                textAlign: "left",
                mb: 6,
              }}
            >
              Access curated study resources
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 4,
              }}
            >
              {studyResources.map((resource) => (
                <Card
                  key={resource.id}
                  sx={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    },
                  }}
                >
                  {/* Video Thumbnail */}
                  <Box
                    sx={{
                      position: "relative",
                      height: "200px",
                      background: resource.thumbnailColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Play Button Overlay */}
                    <Box
                      sx={{
                        width: "60px",
                        height: "60px",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "white",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 0,
                          height: 0,
                          borderLeft: "12px solid #3B82F6",
                          borderTop: "8px solid transparent",
                          borderBottom: "8px solid transparent",
                          marginLeft: "4px",
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#1e293b",
                        mb: 2,
                        fontSize: "1rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {resource.title}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      {resource.source && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#64748b",
                            fontSize: "0.875rem",
                            mb: 0.5,
                          }}
                        >
                          source: {resource.source}
                        </Typography>
                      )}
                      {resource.instructor && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#64748b",
                            fontSize: "0.875rem",
                            mb: 0.5,
                          }}
                        >
                          {resource.instructor}
                        </Typography>
                      )}
                      {resource.exam && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#64748b",
                            fontSize: "0.875rem",
                          }}
                        >
                          {resource.exam}
                        </Typography>
                      )}
                      {resource.audience && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#64748b",
                            fontSize: "0.875rem",
                          }}
                        >
                          {resource.audience}
                        </Typography>
                      )}
                      {resource.institution && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#64748b",
                            fontSize: "0.875rem",
                          }}
                        >
                          {resource.institution}
                        </Typography>
                      )}
                    </Box>

                    <Button
                      variant="outlined"
                      sx={{
                        width: "100%",
                        py: 1,
                        borderRadius: "8px",
                        borderColor: "#e2e8f0",
                        color: "#64748b",
                        textTransform: "none",
                        fontWeight: 500,
                        "&:hover": {
                          borderColor: "#cbd5e1",
                          backgroundColor: "#f1f5f9",
                        },
                      }}
                    >
                      {resource.status}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </>
        )}

        {/* Tablet Layout - Two column (image left, text right) */}
        {isTablet && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              alignItems: "center",
            }}
          >
            {/* Professional Photo - Left Column */}
            <Box
              sx={{
                position: "relative",
                height: "400px",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <Image
                src="/redesign/professionalphotoman.png"
                alt="Professional study resources"
                fill
                style={{
                  objectFit: "contain",
                }}
              />
            </Box>

            {/* Text Content - Right Column */}
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#1e293b",
                  mb: 3,
                  textAlign: "left",
                }}
              >
                Access curated study resources
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontSize: "1.1rem",
                  color: "#64748b",
                  lineHeight: 1.6,
                  mb: 4,
                  textAlign: "left",
                }}
              >
                Quickly find high-quality, exam-relevant materials tailored to
                your certification path — all organized for maximum efficiency
                and impact.
              </Typography>

              <Button
                variant="contained"
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                  backgroundColor: "#3B82F6",
                  color: "white",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#2563EB",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Explore
              </Button>
            </Box>
          </Box>
        )}

        {/* Mobile Layout - Vertical stack */}
        {isMobile && (
          <Box>
            {/* Professional Photo */}
            <Box
              sx={{
                position: "relative",
                height: "300px",
                mb: 4,
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <Image
                src="/redesign/professionalphotoman.png"
                alt="Professional study resources"
                fill
                style={{
                  objectFit: "cover",
                }}
              />
            </Box>

            {/* Text Content */}
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#1e293b",
                  mb: 3,
                  textAlign: "left",
                }}
              >
                Access curated study resources
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontSize: "1rem",
                  color: "#64748b",
                  lineHeight: 1.6,
                  mb: 4,
                  textAlign: "left",
                }}
              >
                Quickly find high-quality, exam-relevant materials tailored to
                your certification path — all organized for maximum efficiency
                and impact.
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Button
                  variant="contained"
                  sx={{
                    px: 4,
                    py: 2,
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderRadius: "8px",
                    backgroundColor: "#3B82F6",
                    color: "white",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#2563EB",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Explore
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
