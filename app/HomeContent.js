"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Avatar,
  Divider,
} from "@mui/material";
import Image from "next/image";
import { motion } from "framer-motion";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import SpeedIcon from "@mui/icons-material/Speed";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useLanguage } from "./contexts/LanguageContext";
import useTranslation from "./hooks/useTranslation";
import LandingNavBar from "./components/LandingNavBar";
import LandingFooterRedesign from "./components/LandingFooterRedesign";
import HeroSection from "./components/HeroSection";
import LearningAdvantageSection from "./components/LearningAdvantageSection";
import StudyResourcesSection from "./components/StudyResourcesSection";
import ChattoSection from "./components/ChattoSection";
import SmarterLearningSection from "./components/SmarterLearningSection";
import SubscriptionSection from "./components/SubscriptionSection";
import CommunitySection from "./components/CommunitySection";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Custom components
const GradientText = ({ children, ...props }) => (
  <Typography
    component="span"
    sx={{
      background: "linear-gradient(90deg, #3B82F6 0%, #EC4899 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      textFillColor: "transparent",
    }}
    {...props}
  >
    {children}
  </Typography>
);

const GlassCard = ({ children, ...props }) => (
  <Box
    sx={{
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(15px)",
      borderRadius: "24px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      boxShadow: "0 15px 50px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Box>
);

const GradientDivider = () => (
  <Box
    sx={{
      width: "120px",
      height: "6px",
      background: "linear-gradient(90deg, #3B82F6 0%, #EC4899 100%)",
      mx: "auto",
      mt: 4,
      mb: 8,
      borderRadius: "4px",
    }}
  />
);

export default function HomeContent() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();

  useEffect(() => {
    if (isLoaded && isSignedIn && window.location.pathname === "/") {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress sx={{ color: "#3B82F6" }} />
      </Box>
    );
  }

  if (isSignedIn) {
    return null;
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        px: { xs: 2, sm: 6 },
        pt: { xs: 8, md: 10 },
        overflow: "hidden",
        bgcolor: "background.default",
        position: "relative",
      }}
    >
      <LandingNavBar />
      <HeroSection />
      <LearningAdvantageSection />
      <StudyResourcesSection />
      <ChattoSection />
      <SmarterLearningSection />
      <SubscriptionSection />
      <CommunitySection />

      <LandingFooterRedesign />
    </Container>
  );
}
