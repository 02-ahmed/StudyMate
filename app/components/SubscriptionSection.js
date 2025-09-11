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

export default function SubscriptionSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // xs only (0-599px)
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg")); // sm, md (600-1199px)
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg")); // lg and xl (1200px+)

  const handleSubscribe = () => {
    // Add subscription logic here
    console.log("Subscribe clicked");
  };

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: "#f8fafc",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: "center",
            maxWidth: "600px",
            mx: "auto",
          }}
        >
          {/* Title - Only show on desktop */}
          <Typography
            variant="h2"
            sx={{
              fontSize: "3rem",
              fontWeight: 700,
              color: "#1e293b",
              mb: 3,
              textAlign: "center",
              display: { xs: "none", sm: "none", md: "block" }, // Only show on desktop (lg+)
            }}
          >
            Excel Beyond Exams
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
              color: "#64748b",
              lineHeight: 1.6,
              mb: 4,
              textAlign: "center",
            }}
          >
            Discover the plan that suits your learning needs, flexible
            cancellation
          </Typography>

          {/* Price */}
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
              fontWeight: 700,
              color: "#1e293b",
              mb: 4,
              textAlign: "center",
            }}
          >
            $4.99 / month
          </Typography>

          {/* Subscribe Button */}
          <Button
            variant="contained"
            onClick={handleSubscribe}
            sx={{
              px: { xs: 6, sm: 8 },
              py: { xs: 2, sm: 2.5 },
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
              fontWeight: 600,
              borderRadius: "50px",
              backgroundColor: "#3B82F6",
              color: "white",
              textTransform: "none",
              minWidth: { xs: "200px", sm: "250px" },
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                backgroundColor: "#2563EB",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Subscribe
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
