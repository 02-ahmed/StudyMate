"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";

export default function ChattoSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // xs only (0-599px)
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg")); // sm, md (600-1199px)
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg")); // lg and xl (1200px+)

  const handleAskChatto = () => {
    window.open("https://chatt0.vercel.app/", "_blank");
  };

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: "#4299E1",
        position: "relative",
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
      }}
    >
      <Container maxWidth="lg">
        {/* Desktop Layout - Two column (text left, laptop right) */}
        {isDesktop && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              alignItems: "center",
            }}
          >
            {/* Text Content - Left Column */}
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: "white",
                  mb: 3,
                  textAlign: "left",
                  lineHeight: 1.2,
                }}
              >
                Your Gateway to Career-Driven Learning
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: 400,
                  color: "white",
                  mb: 4,
                  textAlign: "left",
                  lineHeight: 1.4,
                }}
              >
                Engage, learn, and grow with our AI Tutor powered StudyChat
              </Typography>

              <Button
                variant="contained"
                onClick={handleAskChatto}
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                  backgroundColor: "white",
                  color: "#4299E1",
                  textTransform: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Ask Chatto
              </Button>
            </Box>

            {/* MacBook Image - Right Column */}
            <Box
              sx={{
                position: "relative",
                height: "400px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                src="/redesign/MacBook_Pro_16-inch_space_black_mockup__1_-removebg-preview 1.png"
                alt="MacBook Pro showing StudyChat interface"
                width={600}
                height={400}
                style={{
                  objectFit: "contain",
                }}
              />
            </Box>
          </Box>
        )}

        {/* Tablet Layout - Same as mobile (centered text with inner border) */}
        {isTablet && (
          <Box
            sx={{
              textAlign: "center",
              maxWidth: "600px",
              mx: "auto",
              position: "relative",
            }}
          >
            {/* Inner Border Effect */}
            <Box
              sx={{
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "16px",
                padding: 6,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "white",
                  mb: 3,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                Your Gateway to career driven learning
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontSize: "1.1rem",
                  fontWeight: 400,
                  color: "white",
                  mb: 4,
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                Engage, learn, and grow with our AI Tutor powered StudyChat
              </Typography>

              <Button
                variant="contained"
                onClick={handleAskChatto}
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                  backgroundColor: "white",
                  color: "#4299E1",
                  textTransform: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Ask Chatto
              </Button>
            </Box>
          </Box>
        )}

        {/* Mobile Layout - Single column, centered */}
        {isMobile && (
          <Box
            sx={{
              textAlign: "center",
              maxWidth: "500px",
              mx: "auto",
              position: "relative",
            }}
          >
            {/* Inner Border Effect */}
            <Box
              sx={{
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "16px",
                padding: { xs: 4, sm: 6 },
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "white",
                  mb: 3,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                Your Gateway to career driven learning
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontSize: "1rem",
                  fontWeight: 400,
                  color: "white",
                  mb: 4,
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                Engage, learn, and grow with our AI Tutor powered StudyChat
              </Typography>

              <Button
                variant="contained"
                onClick={handleAskChatto}
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                  backgroundColor: "white",
                  color: "#4299E1",
                  textTransform: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Ask Chatto
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
