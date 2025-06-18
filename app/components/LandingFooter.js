"use client";

import React from "react";
import { Box, Typography, Container } from "@mui/material";
import LandingLanguageSelector from "./LandingLanguageSelector";
import useTranslation from "../hooks/useTranslation";

export default function LandingFooter() {
  const { t } = useTranslation();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(0, 0, 0, 0.06)",
        zIndex: 10,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LandingLanguageSelector inline={true} />
        </Box>
      </Container>
    </Box>
  );
}
