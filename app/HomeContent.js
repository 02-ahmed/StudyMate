"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import Image from "next/image";
import SchoolIcon from '@mui/icons-material/School';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TimelineIcon from '@mui/icons-material/Timeline';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Custom components
const GradientText = ({ children, ...props }) => {
  return (
    <Typography
      component="span"
      sx={{
        background: "linear-gradient(90deg, #5065DB 0%, #7C4DFF 100%)",
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
};

// Glass effect container
const GlassCard = ({ children, ...props }) => (
  <Box
    sx={{
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(10px)",
      borderRadius: "24px",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
      overflow: "hidden",
      ...props.sx
    }}
    {...props}
  >
    {children}
  </Box>
);

// Gradient divider
const GradientDivider = () => (
  <Box
    sx={{
      width: "80px",
      height: "4px",
      background: "linear-gradient(90deg, #5065DB 0%, #7C4DFF 100%)",
      mx: "auto",
      mt: 2,
      mb: 6,
      borderRadius: "2px",
    }}
  />
);

// Background Pattern
const BackgroundPattern = () => (
  <Box
    sx={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      overflow: "hidden",
      opacity: 0.05,
    }}
  >
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id="dots"
          x="0"
          y="0"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="3" cy="3" r="1.5" fill="#3f51b5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  </Box>
);

export default function HomeContent() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));
  const [animate, setAnimate] = useState(false);

  // More cautious redirect approach to avoid potential loops
  useEffect(() => {
    // Only redirect if auth is fully loaded and user is signed in
    // Add a check to ensure we're on the home page to prevent redirect loops
    if (isLoaded && isSignedIn && window.location.pathname === "/") {
      // Use replace instead of push to avoid browser history issues
      router.replace("/dashboard");
    }
    setAnimate(true);
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          minHeight: "100vh",
        }}
      >
        <Box
          component={motion.div}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(45deg, #3f51b5, #6a7dfe)",
            }}
          />
        </Box>
        <CircularProgress />
      </Box>
    );
  }

  // If user is signed in, don't render anything - Clerk will handle the redirect
  if (isSignedIn) {
    return null;
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        px: { xs: 2, sm: 3 },
        overflow: "hidden",
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, sm: 10, md: 14 },
          minHeight: { xs: "auto", md: "90vh" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <HeroBackground />

        <motion.div variants={fadeInUp}>
          <Typography
            variant="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
              lineHeight: { xs: 1.2, md: 1.1 },
              mb: 3,
              letterSpacing: "-0.02em",
            }}
          >
            Transform Your{" "}
            <GradientText
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
                lineHeight: { xs: 1.2, md: 1.1 },
                mb: 3,
                letterSpacing: "-0.02em",
              }}
            >
              Study Experience
            </GradientText>
          </Typography>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Typography
            variant="h5"
            sx={{
              color: "text.secondary",
              mb: { xs: 4, md: 5 },
              maxWidth: "800px",
              mx: "auto",
              fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
              px: { xs: 2, sm: 0 },
              lineHeight: 1.6,
            }}
          >
            Create smart flashcards, generate study notes, and track your
            progress with AI-powered learning tools.
          </Typography>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Box
            sx={{
              display: "flex",
              gap: { xs: 2, sm: 3 },
              justifyContent: "center",
              flexDirection: { xs: "column", sm: "row" },
              px: { xs: 2, sm: 0 },
              mt: 2,
            }}
          >
            {isSignedIn ? (
              <Button
                variant="contained"
                size="large"
                href="/generate"
                sx={{
                  px: { xs: 4, sm: 5 },
                  py: { xs: 1.5, sm: 1.75 },
                  fontSize: { xs: "1.1rem", sm: "1.2rem" },
                  width: { xs: "100%", sm: "auto" },
                  borderRadius: "50px",
                  background:
                    "linear-gradient(45deg, #3f51b5 30%, #6a7dfe 90%)",
                  boxShadow: "0 8px 20px rgba(63, 81, 181, 0.25)",
                  textTransform: "none",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 10px 25px rgba(63, 81, 181, 0.4)",
                  },
                }}
              >
                Generate Notes
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                href="/sign-up"
                sx={{
                  px: { xs: 4, sm: 5 },
                  py: { xs: 1.5, sm: 1.75 },
                  fontSize: { xs: "1.1rem", sm: "1.2rem" },
                  width: { xs: "100%", sm: "auto" },
                  borderRadius: "50px",
                  background:
                    "linear-gradient(45deg, #3f51b5 30%, #6a7dfe 90%)",
                  boxShadow: "0 8px 20px rgba(63, 81, 181, 0.25)",
                  textTransform: "none",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 10px 25px rgba(63, 81, 181, 0.4)",
                  },
                }}
              >
                Get Started
              </Button>
            )}

            {!isSignedIn && (
              <Button
                variant="outlined"
                size="large"
                href="/sign-up"
                sx={{
                  px: { xs: 4, sm: 5 },
                  py: { xs: 1.5, sm: 1.75 },
                  fontSize: { xs: "1.1rem", sm: "1.2rem" },
                  width: { xs: "100%", sm: "auto" },
                  borderRadius: "50px",
                  borderWidth: "2px",
                  borderColor: "#3f51b5",
                  textTransform: "none",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderWidth: "2px",
                    transform: "translateY(-3px)",
                    boxShadow: "0 6px 15px rgba(63, 81, 181, 0.15)",
                  },
                }}
              >
                Sign Up Free
              </Button>
            )}
          </Box>
        </motion.div>

        <Box
          component={motion.div}
          variants={fadeInUp}
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: "250px", sm: "350px", md: "400px" },
            mt: 8,
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Image
            src="/images/group.png"
            alt="Group image"
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
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(63,81,181,0.05) 100%)",
            }}
          />
        </Box>
      </Box>

      {/* Features Section */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        sx={{
          py: { xs: 8, sm: 12 },
          position: "relative",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: { xs: "2rem", sm: "2.75rem", md: "3.5rem" },
            mb: 2,
          }}
        >
          Powerful Features
        </Typography>
        
        <GradientDivider />

        <Grid
          container
          spacing={{ xs: 3, sm: 4, md: 5 }}
          sx={{
            maxWidth: "1200px",
            mx: "auto",
          }}
        >
          {[
            {
              title: "AI-Powered Notes",
              description:
                "Transform any text into organized study materials with our advanced AI technology.",
              icon: "📝",
              color: "#e3f2fd",
            },
            {
              title: "Smart Review System",
              description:
                "Track your progress and review cards at the optimal time for better retention.",
              icon: "🧠",
              color: "#e8eaf6",
            },
            {
              title: "Study Analytics",
              description:
                "Get insights into your learning progress and identify areas for improvement.",
              icon: "📊",
              color: "#e1f5fe",
            },
          ].map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                component={motion.div}
                whileHover={{
                  y: -10,
                  boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
                sx={{
                  height: "100%",
                  p: { xs: 3, sm: 4 },
                  borderRadius: "24px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                  overflow: "visible",
                  background: `linear-gradient(145deg, white 0%, ${feature.color} 100%)`,
                  border: "1px solid rgba(63, 81, 181, 0.08)",
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "16px",
                      background: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      mb: 2,
                      boxShadow: "0 8px 16px rgba(0,0,0,0.06)",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.4rem", sm: "1.6rem" },
                      mb: 2,
                      color: "#263238",
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* How It Works Section */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        sx={{
          py: { xs: 8, sm: 12 },
          background:
            "linear-gradient(180deg, rgba(63,81,181,0.03) 0%, rgba(63,81,181,0.08) 100%)",
          borderRadius: "32px",
          px: { xs: 2, sm: 4, md: 6 },
          position: "relative",
          overflow: "hidden",
          mt: { xs: 6, sm: 10 },
          mb: { xs: 6, sm: 10 },
        }}
      >
        <Typography
          variant="h2"
          sx={{
            textAlign: "center",
            fontWeight: 700,
            color: "#263238",
            mb: 2,
            fontSize: { xs: "2rem", sm: "2.75rem", md: "3.5rem" },
          }}
        >
          How It Works
        </Typography>
        
        <GradientDivider />

        <Grid container spacing={{ xs: 5, sm: 8 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box
              component={motion.div}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              sx={{
                position: "relative",
                height: { xs: "280px", sm: "400px", md: "450px" },
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                transform: "perspective(1000px) rotateY(-5deg)",
              }}
            >
              <Image
                src="/images/study.jpg"
                alt="Study process"
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
                    "linear-gradient(0deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%)",
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ pl: { md: 4 } }}>
              {[
                {
                  number: "01",
                  title: "Input Your Study Material",
                  description:
                    "Simply paste your text or upload your notes. Our system accepts various formats including PDFs, text files, or even images with text.",
                },
                {
                  number: "02",
                  title: "Generate Smart Notes",
                  description:
                    "Our AI analyzes your content and creates organized flashcards and study materials optimized for retention and understanding.",
                },
                {
                  number: "03",
                  title: "Review and Learn",
                  description:
                    "Study effectively with our smart review system that adapts to your learning pace and optimizes when to review each concept.",
                },
              ].map((step, index) => (
                <Box
                  key={index}
                  component={motion.div}
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  sx={{
                    mb: 5,
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(45deg, #3f51b5 30%, #6a7dfe 90%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      mr: 3,
                      boxShadow: "0 6px 12px rgba(63, 81, 181, 0.2)",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "white",
                        fontWeight: 700,
                        fontSize: "1.2rem",
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
                        fontSize: { xs: "1.3rem", sm: "1.5rem" },
                        mb: 1,
                        color: "#263238",
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                        lineHeight: 1.6,
                      }}
                    >
                      {step.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Testimonial Section */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        sx={{
          py: { xs: 8, sm: 10 },
          mt: { xs: 4, sm: 6 },
        }}
      >
        <Typography
          variant="h2"
          sx={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: { xs: "2rem", sm: "2.75rem", md: "3.5rem" },
            mb: 2,
          }}
        >
          What Our Users Say
        </Typography>

        <Grid container spacing={4} sx={{ maxWidth: "1200px", mx: "auto" }}>
          {[
            {
              name: "James Blay",
              role: "Engineering Student",
              quote:
                "This app has completely transformed how I study for Egineering exams. The AI-generated notes save me hours of work!",
            },
            {
              name: "Gina Lucy",
              role: "Law Student",
              quote:
                "The smart review system helped me memorize complex legal concepts much faster than traditional methods.",
            },
            {
              name: "Duvor William",
              role: "Computer Science Student",
              quote:
                "As a CS student, I appreciate how the platform organizes technical information in an easy-to-review format.",
            },
          ].map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                component={motion.div}
                whileHover={{ y: -8 }}
                sx={{
                  height: "100%",
                  p: { xs: 3, sm: 4 },
                  borderRadius: "24px",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(63, 81, 181, 0.06)",
                  background: "white",
                  position: "relative",
                  overflow: "visible",
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      left: 30,
                      fontSize: "4rem",
                      color: "#3f51b5",
                      opacity: 0.2,
                      fontFamily: "serif",
                      lineHeight: 1,
                    }}
                  ></Box>
                  <Typography
                    sx={{
                      fontSize: { xs: "1.1rem", sm: "1.2rem" },
                      lineHeight: 1.7,
                      mb: 4,
                      color: "#455a64",
                      position: "relative",
                      fontStyle: "italic",
                    }}
                  >
                    {testimonial.quote}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        background: `linear-gradient(${
                          index * 60
                        }deg, #3f51b5, #6a7dfe)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        mr: 2,
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#263238" }}>
                        {testimonial.name}
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: "0.9rem" }}
                      >
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, sm: 10 },
          textAlign: "center",
          px: { xs: 2, sm: 3 },
          mb: { xs: 6, sm: 8 },
          background:
            "linear-gradient(135deg, rgba(63,81,181,0.08) 0%, rgba(106,125,254,0.12) 100%)",
          borderRadius: "32px",
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
            opacity: 0.05,
            zIndex: 0,
          }}
        >
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="wave"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 25C 20 10, 30 10, 50 25, 70 40, 80 40, 100 25L 100 100 L 0 100Z"
                  fill="#3f51b5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wave)" />
          </svg>
        </Box>

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              mb: 3,
              background: "linear-gradient(45deg, #3f51b5 30%, #6a7dfe 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textFillColor: "transparent",
            }}
          >
            Ready to Transform Your Study Habits?
          </Typography>
          <Typography
            sx={{
              mb: { xs: 4, sm: 5 },
              maxWidth: "700px",
              mx: "auto",
              color: "#455a64",
              fontSize: { xs: "1.1rem", sm: "1.2rem" },
              lineHeight: 1.6,
            }}
          >
            Join thousands of students who are already studying smarter, not
            harder. Get started today and see the difference!
          </Typography>

          <Button
            variant="contained"
            size="large"
            href="/sign-up"
            sx={{
              px: { xs: 5, sm: 6 },
              py: { xs: 1.5, sm: 2 },
              width: { xs: "100%", sm: "auto" },
              borderRadius: "50px",
              background: "linear-gradient(45deg, #3f51b5 30%, #6a7dfe 90%)",
              boxShadow: "0 10px 30px rgba(63, 81, 181, 0.3)",
              fontSize: "1.2rem",
              textTransform: "none",
              fontWeight: 600,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-3px) scale(1.05)",
                boxShadow: "0 15px 35px rgba(63, 81, 181, 0.4)",
              },
            }}
          >
            Start Learning Now
          </Button>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mt: 3,
              fontSize: "0.9rem",
              order: { xs: 2, sm: 1 },
            }}
          >
            © {new Date().getFullYear()} StudyMate. All rights reserved.
          </Typography>
          
          <Box 
            sx={{ 
              display: "flex", 
              gap: 3,
              order: { xs: 1, sm: 2 },
              mb: { xs: 2, sm: 0 },
            }}
          >
            {['Terms', 'Privacy', 'Cookies'].map((item) => (
              <Typography
                key={item}
                component="a"
                href="#"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  "&:hover": {
                    color: "#5065DB",
                  },
                }}
              >
                {item}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
