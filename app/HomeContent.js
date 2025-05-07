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
        overflow: "hidden",
        bgcolor: "background.default",
        position: "relative",
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, sm: 16, md: 20 },
          minHeight: { xs: "100vh", md: "100vh" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          mt: { xs: 6, sm: 0 },
        }}
      >
        <Grid container spacing={{ xs: 6, sm: 4 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeIn}>
                <Typography
                  variant="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: "2.8rem", sm: "3.5rem", md: "3.5rem" },
                    lineHeight: 1.1,
                    mb: { xs: 3, sm: 4 },
                    letterSpacing: "-0.03em",
                    background:
                      "linear-gradient(90deg,rgb(182, 52, 214) 0%, #4f46e5 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "transparent",
                    textAlign: { xs: "center", sm: "left" },
                  }}
                >
                  Memorize Anything{" "}
                  <span
                    style={{
                      fontWeight: 900,
                      background:
                        "linear-gradient(90deg,rgb(182, 52, 214) 0%,rgb(44, 34, 240) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    With Ease
                  </span>
                </Typography>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Typography
                  variant="h5"
                  sx={{
                    color: "text.secondary",
                    mb: { xs: 4, sm: 6 },
                    maxWidth: "600px",
                    fontSize: { xs: "1.3rem", sm: "1.5rem", md: "1.5rem" },
                    lineHeight: 1.8,
                    textAlign: { xs: "center", sm: "left" },
                    mx: { xs: "auto", sm: 0 },
                  }}
                >
                  Unleash your potential with AI-powered flashcards, smart
                  notes, personalized learning analytics & more
                </Typography>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 2, sm: 3 },
                    flexDirection: { xs: "column", sm: "row" },
                    mt: { xs: 3, sm: 4 },
                    width: "100%",
                    justifyContent: { xs: "center", sm: "flex-start" },
                  }}
                >
                  <Button
                    variant="contained"
                    href="/sign-up"
                    sx={{
                      px: { xs: 4, sm: 6 },
                      py: { xs: 1.5, sm: 2 },
                      fontSize: { xs: "1.1rem", sm: "1.2rem" },
                      borderRadius: "50px",
                      background:
                        "linear-gradient(45deg, #3B82F6 30%, #EC4899 90%)",
                      boxShadow: "0 12px 40px rgba(59, 130, 246, 0.4)",
                      textTransform: "none",
                      fontWeight: 700,
                      width: { xs: "100%", sm: "auto" },
                      "&:hover": {
                        boxShadow: "0 20px 50px rgba(59, 130, 246, 0.5)",
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    Get Started
                  </Button>

                  <Button
                    variant="outlined"
                    size="medium"
                    href="/sign-up"
                    sx={{
                      px: { xs: 4, sm: 6 },
                      py: { xs: 1.5, sm: 2 },
                      fontSize: { xs: "1.1rem", sm: "1.2rem" },
                      borderRadius: "50px",
                      borderWidth: "2px",
                      borderColor: "#3B82F6",
                      color: "#3B82F6",
                      textTransform: "none",
                      fontWeight: 700,
                      width: { xs: "100%", sm: "auto" },
                      "&:hover": {
                        boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)",
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    Sign Up For Free
                  </Button>
                </Box>
              </motion.div>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Box
                sx={{
                  position: "relative",
                  height: { xs: "280px", sm: "450px", md: "550px" },
                  borderRadius: { xs: "24px", sm: "32px" },
                  overflow: "hidden",
                  boxShadow: "0 25px 60px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    transform: "scale(1.03)",
                  },
                  mx: { xs: "auto", sm: 0 },
                  maxWidth: { xs: "100%", sm: "none" },
                }}
              >
                <Image
                  src="/images/1st image.jpg"
                  alt="Collaborative study"
                  layout="fill"
                  objectFit="cover"
                  priority
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(59,130,246,0.15) 100%)",
                  }}
                />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          py: { xs: 8, sm: 16 },
          bgcolor: "background.paper",
          borderRadius: { xs: "24px", sm: "32px" },
          position: "relative",
          mt: { xs: 6, sm: 10 },
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeIn}>
            <Typography
              variant="h2"
              sx={{
                textAlign: "center",
                fontWeight: 800,
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                mb: { xs: 2, sm: 4 },
                background:
                  "linear-gradient(90deg,rgb(182, 52, 214) 0%, #4f46e5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Cutting-Edge Features
            </Typography>
          </motion.div>

          <motion.div variants={fadeIn}>
            <GradientDivider />
          </motion.div>

          <Grid
            container
            spacing={{ xs: 3, sm: 5 }}
            sx={{ maxWidth: "1400px", mx: "auto", px: { xs: 2, sm: 0 } }}
          >
            {[
              {
                title: "Smart Notes",
                description:
                  "AI-driven note generation creates concise, impactful study materials.",
                icon: <LightbulbIcon sx={{ fontSize: 36, color: "#3B82F6" }} />,
                color: "#EFF6FF",
              },
              {
                title: "Adaptive Review",
                description:
                  "Personalized learning schedules maximize retention and efficiency.",
                icon: <SpeedIcon sx={{ fontSize: 36, color: "#3B82F6" }} />,
                color: "#F5F3FF",
              },
              {
                title: "Deep Analytics",
                description:
                  "Actionable insights track progress and optimize study focus.",
                icon: (
                  <AssessmentIcon sx={{ fontSize: 36, color: "#3B82F6" }} />
                ),
                color: "#F0F9FF",
              },
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  variants={fadeIn}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard
                    sx={{
                      height: "100%",
                      p: { xs: 5, sm: 6 },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Box
                      sx={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "20px",
                        background: feature.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 4,
                        boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "1.6rem", sm: "1.8rem" },
                        mb: 3,
                        color: "text.primary",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: "1.2rem", sm: "1.3rem" },
                        lineHeight: 1.8,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </GlassCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>

      {/* How It Works Section */}
      <Box
        sx={{
          py: { xs: 8, sm: 16 },
          background: "linear-gradient(180deg, #F0F9FF 0%, #FCE7F3 100%)",
          borderRadius: { xs: "24px", sm: "32px" },
          px: { xs: 2, sm: 6, md: 10 },
          mt: { xs: 6, sm: 14 },
          mb: { xs: 6, sm: 14 },
          position: "relative",
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeIn}>
            <Typography
              variant="h2"
              sx={{
                textAlign: "center",
                fontWeight: 800,
                color: "text.primary",
                mb: { xs: 2, sm: 4 },
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                background:
                  "linear-gradient(90deg,rgb(182, 52, 214) 0%, #4f46e5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Your Learning Blueprint
            </Typography>
          </motion.div>

          <motion.div variants={fadeIn}>
            <GradientDivider />
          </motion.div>

          <Grid container spacing={{ xs: 4, sm: 8 }} alignItems="center">
            <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
              >
                {[
                  {
                    number: "01",
                    title: "Input Content",
                    description:
                      "Upload text, PDFs, or images effortlessly with our intuitive interface.",
                  },
                  {
                    number: "02",
                    title: "AI Transformation",
                    description:
                      "Advanced AI converts your content into optimized study resources.",
                  },
                  {
                    number: "03",
                    title: "Master Concepts",
                    description:
                      "Learn smarter with adaptive, personalized review sessions.",
                  },
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    variants={fadeIn}
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      sx={{
                        mb: { xs: 4, sm: 6 },
                        display: "flex",
                        alignItems: { xs: "center", sm: "flex-start" },
                        flexDirection: { xs: "column", sm: "row" },
                        textAlign: { xs: "center", sm: "left" },
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: "60px", sm: "64px" },
                          height: { xs: "60px", sm: "64px" },
                          borderRadius: "20px",
                          background:
                            "linear-gradient(45deg, #3B82F6 30%, #EC4899 90%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          mr: { xs: 0, sm: 4 },
                          mb: { xs: 2, sm: 0 },
                          boxShadow: "0 10px 25px rgba(59, 130, 246, 0.4)",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "white",
                            fontWeight: 700,
                            fontSize: "1.4rem",
                          }}
                        >
                          {step.number}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: "1.4rem", sm: "1.7rem" },
                            mb: { xs: 1, sm: 2 },
                            color: "text.primary",
                          }}
                        >
                          {step.title}
                        </Typography>
                        <Typography
                          sx={{
                            color: "text.secondary",
                            fontSize: { xs: "1.1rem", sm: "1.3rem" },
                            lineHeight: 1.8,
                          }}
                        >
                          {step.description}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: { xs: "280px", sm: "480px", md: "560px" },
                    borderRadius: { xs: "24px", sm: "32px" },
                    overflow: "hidden",
                    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.2)",
                    transition: "all 0.3s ease",
                    mb: { xs: 4, sm: 0 },
                  }}
                >
                  <Image
                    src="/images/2nd image.jpg"
                    alt="Study visualization"
                    layout="fill"
                    objectFit="cover"
                    priority
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%)",
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Box>

      {/* Testimonial Section */}
      <Box
        sx={{
          py: { xs: 8, sm: 16 },
          bgcolor: "background.paper",
          borderRadius: { xs: "24px", sm: "32px" },
          mt: { xs: 6, sm: 12 },
          px: { xs: 2, sm: 0 },
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeIn}>
            <Typography
              variant="h2"
              sx={{
                textAlign: "center",
                fontWeight: 800,
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                mb: { xs: 2, sm: 4 },
                background:
                  "linear-gradient(90deg,rgb(182, 52, 214) 0%, #4f46e5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Voices of Success
            </Typography>
          </motion.div>

          <motion.div variants={fadeIn}>
            <GradientDivider />
          </motion.div>

          <Grid
            container
            spacing={{ xs: 3, sm: 4 }}
            sx={{ maxWidth: "1400px", mx: "auto" }}
          >
            {[
              {
                name: "James Blay",
                role: "Engineering Student",
                quote:
                  "This platform transformed my study routine, doubling my efficiency!",
              },
              {
                name: "Gina Lucy",
                role: "HR Manager of a Company",
                quote:
                  "AI flashcards streamlined our employee training process, making onboarding faster and more engaging.",
              },
              {
                name: "Duvor William",
                role: "Working Professional",
                quote:
                  "Balancing work and upskilling was tough, but this tool made learning efficient and flexible.",
              },
            ].map((testimonial, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  variants={fadeIn}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard
                    sx={{
                      height: "100%",
                      p: { xs: 4, sm: 6 },
                      position: "relative",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <FormatQuoteIcon
                      sx={{
                        color: "#3B82F6",
                        opacity: 0.3,
                        fontSize: { xs: "3rem", sm: "4rem" },
                        position: "absolute",
                        top: 20,
                        left: 20,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: { xs: "1.1rem", sm: "1.4rem" },
                        lineHeight: 1.9,
                        mb: { xs: 4, sm: 6 },
                        color: "text.secondary",
                        fontStyle: "italic",
                        pl: { xs: 3, sm: 4 },
                      }}
                    >
                      {testimonial.quote}
                    </Typography>
                    <Divider
                      sx={{
                        mb: { xs: 3, sm: 5 },
                        borderColor: "rgba(59, 130, 246, 0.15)",
                      }}
                    />
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        sx={{
                          background: `linear-gradient(${
                            index * 60
                          }deg, #3B82F6, #EC4899)`,
                          color: "white",
                          fontWeight: 700,
                          mr: 3,
                          width: { xs: 48, sm: 56 },
                          height: { xs: 48, sm: 56 },
                        }}
                      >
                        {testimonial.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            fontSize: { xs: "1.1rem", sm: "1.2rem" },
                          }}
                        >
                          {testimonial.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: "text.secondary",
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          }}
                        >
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </GlassCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, sm: 16 },
          textAlign: "center",
          px: { xs: 2, sm: 6 },
          mb: { xs: 8, sm: 14 },
          background: "linear-gradient(135deg, #DBEAFE 0%, #FCE7F3 100%)",
          borderRadius: { xs: "24px", sm: "32px" },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.1,
            zIndex: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233B82F6' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeIn}>
            <Typography
              variant="h3"
              gutterBottom
              sx={{
                fontWeight: 900,
                fontSize: { xs: "2.3rem", sm: "3.5rem", md: "4rem" },
                mb: { xs: 3, sm: 5 },
                background: "linear-gradient(45deg, #3B82F6 30%, #EC4899 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textFillColor: "transparent",
              }}
            >
              Ignite Your Academic Journey
            </Typography>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Typography
              sx={{
                mb: { xs: 4, sm: 6 },
                maxWidth: "900px",
                mx: "auto",
                color: "text.secondary",
                fontSize: { xs: "1.1rem", sm: "1.4rem" },
                lineHeight: 1.9,
                px: { xs: 2, sm: 0 },
              }}
            >
              Join thousands of learners revolutionizing their memorization
              skills with our cutting-edge AI tools. Start today and unlock your
              full potential!
            </Typography>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Button
              variant="contained"
              size="large"
              href="/sign-up"
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: { xs: 5, sm: 7 },
                py: { xs: 1.8, sm: 2.5 },
                borderRadius: "50px",
                background: "linear-gradient(45deg, #3B82F6 30%, #EC4899 90%)",
                boxShadow: "0 15px 50px rgba(59, 130, 246, 0.5)",
                fontSize: { xs: "1.2rem", sm: "1.4rem" },
                textTransform: "none",
                fontWeight: 700,
                width: { xs: "90%", sm: "auto" },
                "&:hover": {
                  boxShadow: "0 25px 60px rgba(59, 130, 246, 0.6)",
                  transform: "scale(1.05)",
                },
              }}
            >
              Launch Your Success
            </Button>
          </motion.div>
        </motion.div>
      </Box>
    </Container>
  );
}
