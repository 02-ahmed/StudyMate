"use client";

import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import Image from "next/image";

export default function HeroSection() {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Image
          src="/redesign/lady-smile.png"
          alt="Professional study environment"
          layout="fill"
          objectFit="cover"
          priority
        />
      </Box>

      {/* Dark Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 2,
        }}
      />

      {/* Content */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 3 }}>
        <Box
          sx={{
            maxWidth: "600px",
            py: { xs: 8, md: 12 },
            mx: { xs: "auto", sm: "auto", md: "auto", lg: 0 }, // Center on tablet, left-align on desktop
          }}
        >
          {/* Main Headline - Stacked */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
              fontWeight: 700,
              color: "white",
              lineHeight: 1.1,
              mb: 3,
              textAlign: {
                xs: "center",
                sm: "center",
                md: "center",
                lg: "left",
              }, // Center on tablet, left on desktop
            }}
          >
            Pass professional <br />
            certifications <br />
            with ease!
          </Typography>

          {/* Sub-headline */}
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.5rem" },
              color: "white",
              lineHeight: 1.4,
              mb: 4,
              textAlign: {
                xs: "center",
                sm: "center",
                md: "center",
                lg: "left",
              }, // Center on tablet, left on desktop
              opacity: 0.9,
            }}
          >
            Learn faster, retain more, and pass with confidence.
          </Typography>

          {/* CTA Button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: {
                xs: "center",
                sm: "center",
                md: "center",
                lg: "flex-start",
              }, // Center on tablet, left on desktop
            }}
          >
            <Button
              variant="contained"
              href="/sign-up"
              sx={{
                px: 4,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: "8px",
                backgroundColor: "#60A5FA", // Light blue
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
              Get Started
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
