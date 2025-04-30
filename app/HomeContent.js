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
  Avatar,
  Fade,
  Zoom,
  Slide,
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
        <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="2" fill="#5065DB" />
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

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
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
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(45deg, #5065DB, #7C4DFF)",
            animation: "pulse 1.5s infinite ease-in-out",
            "@keyframes pulse": {
              "0%": { transform: "scale(0.95)", opacity: 0.5 },
              "50%": { transform: "scale(1.05)", opacity: 1 },
              "100%": { transform: "scale(0.95)", opacity: 0.5 },
            },
          }}
        />
      </Box>
    );
  }

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
        <BackgroundPattern />
        
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Slide direction="right" in={animate} timeout={800} mountOnEnter>
              <Box>
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
                  Transform Your Study Experience
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    color: "text.secondary",
                    mb: { xs: 4, md: 5 },
                    fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.4rem" },
                    lineHeight: 1.6,
                    fontWeight: 400,
                  }}
                >
                  Create smart flashcards, generate comprehensive study notes, and track your
                  learning progress with our AI-powered educational tools.
                </Typography>
                
                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 2, sm: 3 },
                    flexDirection: { xs: "column", sm: "row" },
                    mt: 4,
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    href="/generate"
                    endIcon={<AutoAwesomeIcon />}
                    sx={{
                      px: { xs: 4, sm: 5 },
                      py: { xs: 1.5, sm: 1.75 },
                      fontSize: { xs: "1.1rem", sm: "1.2rem" },
                      width: { xs: "100%", sm: "auto" },
                      borderRadius: "12px",
                      background: "linear-gradient(45deg, #5065DB 30%, #7C4DFF 90%)",
                      boxShadow: "0 8px 20px rgba(80, 101, 219, 0.25)",
                      textTransform: "none",
                      fontWeight: 600,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 10px 25px rgba(80, 101, 219, 0.4)",
                      },
                    }}
                  >
                    Try Generate Notes
                  </Button>
                  {!isSignedIn && (
                    <Button
                      variant="outlined"
                      size="large"
                      href="/sign-up"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        px: { xs: 4, sm: 5 },
                        py: { xs: 1.5, sm: 1.75 },
                        fontSize: { xs: "1.1rem", sm: "1.2rem" },
                        width: { xs: "100%", sm: "auto" },
                        borderRadius: "12px",
                        borderWidth: "2px",
                        borderColor: "#5065DB",
                        textTransform: "none",
                        fontWeight: 600,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderWidth: "2px",
                          transform: "translateY(-3px)",
                          boxShadow: "0 6px 15px rgba(80, 101, 219, 0.15)",
                        },
                      }}
                    >
                      Sign Up Free
                    </Button>
                  )}
                </Box>
                
                <Box 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    mt: 4, 
                    gap: 2,
                    opacity: 0.8,
                    flexWrap: "wrap"
                  }}
                >
                  {["No credit card", "Free plan available", "Instant access"].map((text, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 1,
                        fontSize: "0.9rem",
                        color: "text.secondary",
                      }}
                    >
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 6, 
                          height: 6, 
                          borderRadius: "50%", 
                          bgcolor: "#5065DB" 
                        }} 
                      />
                      {text}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Slide>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Fade in={animate} timeout={1200}>
              <Box sx={{ position: "relative" }}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: { xs: "300px", sm: "400px", md: "500px" },
                    borderRadius: "24px",
                    overflow: "hidden",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                    transform: isMobile ? "none" : "perspective(1000px) rotateY(-5deg)",
                    transition: "transform 0.5s ease",
                    "&:hover": {
                      transform: isMobile ? "none" : "perspective(1000px) rotateY(0deg)",
                    },
                  }}
                >
                  <Image
                    src="/images/studer.jpg"
                    alt="Students studying together"
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
                      background: "linear-gradient(0deg, rgba(80, 101, 219, 0.2) 0%, rgba(0,0,0,0) 50%)",
                    }}
                  />
                </Box>
                
                {/* Floating Cards */}
                <GlassCard
                  sx={{
                    position: "absolute",
                    top: "10%",
                    right: "-10%",
                    p: 2,
                    width: "180px",
                    height: "90px",
                    display: { xs: "none", md: "flex" },
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    animation: "float 6s ease-in-out infinite",
                    "@keyframes float": {
                      "0%, 100%": { transform: "translateY(0px)" },
                      "50%": { transform: "translateY(-15px)" },
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "white" }}>
                    2,500+
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    Active Students
                  </Typography>
                </GlassCard>
                
                <GlassCard
                  sx={{
                    position: "absolute",
                    bottom: "15%",
                    left: "-5%",
                    p: 2,
                    width: "180px",
                    height: "90px",
                    display: { xs: "none", md: "flex" },
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    animation: "float 6s ease-in-out infinite 1s",
                    "@keyframes float": {
                      "0%, 100%": { transform: "translateY(0px)" },
                      "50%": { transform: "translateY(-15px)" },
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "white" }}>
                    98%
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    Satisfaction Rate
                  </Typography>
                </GlassCard>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Box>

      {/* Features Section */}
      <Box
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
          spacing={{ xs: 4, sm: 5 }} 
          sx={{ 
            maxWidth: "1200px", 
            mx: "auto",
          }}
        >
          {[
            {
              title: "AI-Powered Notes",
              description: "Transform any text into organized, comprehensive study materials with our advanced AI technology that identifies key concepts.",
              icon: <AutoAwesomeIcon sx={{ fontSize: "2rem" }} />,
              color: "#5065DB",
              delay: 200,
            },
            {
              title: "Smart Review System",
              description: "Track your progress and review cards at the optimal time for better retention, using spaced repetition principles.",
              icon: <SchoolIcon sx={{ fontSize: "2rem" }} />,
              color: "#7C4DFF",
              delay: 400,
            },
            {
              title: "Study Analytics",
              description: "Get detailed insights into your learning progress and identify areas for improvement with interactive dashboards.",
              icon: <TimelineIcon sx={{ fontSize: "2rem" }} />,
              color: "#5065DB",
              delay: 600,
            },
          ].map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Zoom in={animate} style={{ transitionDelay: `${feature.delay}ms` }}>
                <Card
                  sx={{
                    height: "100%",
                    p: { xs: 3, sm: 4 },
                    borderRadius: "20px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                    overflow: "visible",
                    border: "1px solid rgba(80, 101, 219, 0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "16px",
                        background: `linear-gradient(135deg, ${feature.color} 0%, ${index % 2 === 0 ? '#7C4DFF' : '#5065DB'} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        mb: 3,
                        boxShadow: `0 8px 20px rgba(${index % 2 === 0 ? '80, 101, 219' : '124, 77, 255'}, 0.2)`,
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
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* How It Works Section */}
      <Box 
        sx={{ 
          py: { xs: 8, sm: 12 },
          background: "linear-gradient(135deg, rgba(80,101,219,0.05) 0%, rgba(124,77,255,0.08) 100%)",
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
            <Fade in={animate} timeout={1000}>
              <Box
                sx={{
                  position: "relative",
                  height: { xs: "300px", sm: "400px", md: "500px" },
                  borderRadius: "24px",
                  overflow: "hidden",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                  transition: "transform 0.5s ease, box-shadow 0.5s ease",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <Image
                  src = "/images/works.jpg"
                  alt="Students collaborating"
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
                    background: "linear-gradient(0deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%)",
                  }}
                />
              </Box>
            </Fade>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ pl: { md: 4 } }}>
              {[
                {
                  number: "01",
                  title: "Input Your Study Material",
                  description: "Simply paste your text or upload your notes. Our system accepts various formats including PDFs, text files, or even images with text.",
                },
                {
                  number: "02",
                  title: "Generate Smart Notes",
                  description: "Our AI analyzes your content and creates organized flashcards and study materials optimized for retention and understanding.",
                },
                {
                  number: "03",
                  title: "Review and Learn",
                  description: "Study effectively with our smart review system that adapts to your learning pace and optimizes when to review each concept.",
                },
              ].map((step, index) => (
                <Fade 
                  key={index} 
                  in={animate} 
                  timeout={1000} 
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <Box
                    sx={{ 
                      mb: 5,
                      display: "flex",
                      alignItems: "flex-start",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "translateX(10px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "14px",
                        background: `linear-gradient(45deg, #5065DB 30%, #7C4DFF 90%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        mr: 3,
                        boxShadow: "0 6px 12px rgba(80, 101, 219, 0.2)",
                      }}
                    >
                      <Typography sx={{ color: "white", fontWeight: 700, fontSize: "1.2rem" }}>
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
                </Fade>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Testimonial Section */}
      <Box
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
        
        <GradientDivider />
        
        <Grid container spacing={4} sx={{ maxWidth: "1200px", mx: "auto" }}>
          {[
            {
              name: "James Blay",
              role: "Engineering Student",
              quote: "This app has completely transformed how I study for Engineering exams. The AI-generated notes save me hours of work!",
              image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
              delay: 200,
            },
            {
              name: "Gina Lucy",
              role: "Law Student",
              quote: "The smart review system helped me memorize complex legal concepts much faster than traditional methods. I'm seeing significant improvement in my grades.",
              image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
              delay: 400,
            },
            {
              name: "Duvor William",
              role: "Computer Science Student",
              quote: "As a CS student, I appreciate how the platform organizes technical information in an easy-to-review format. The interface is clean and intuitive.",
              image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
              delay: 600,
            },
          ].map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Fade in={animate} timeout={1000} style={{ transitionDelay: `${testimonial.delay}ms` }}>
                <Card
                  sx={{
                    height: "100%",
                    p: { xs: 3, sm: 4 },
                    borderRadius: "20px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    border: "1px solid rgba(80, 101, 219, 0.06)",
                    background: "white",
                    position: "relative",
                    overflow: "visible",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <FormatQuoteIcon
                      sx={{
                        position: "absolute",
                        top: -15,
                        left: 20,
                        fontSize: "3rem",
                        color: "#5065DB",
                        opacity: 0.2,
                      }}
                    />
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
                      "{testimonial.quote}"
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        src={testimonial.image}
                        alt={testimonial.name}
                        sx={{ 
                          width: 56, 
                          height: 56,
                          mr: 2,
                          border: "2px solid white",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: "#263238", fontSize: "1.1rem" }}>
                          {testimonial.name}
                        </Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: "0.95rem" }}>
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
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
          background: "linear-gradient(135deg, rgba(80,101,219,0.08) 0%, rgba(124,77,255,0.12) 100%)",
          borderRadius: "32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <BackgroundPattern />
        
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Zoom in={animate} timeout={800}>
            <Typography
              variant="h3"
              gutterBottom
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                mb: 3,
                background: "linear-gradient(45deg, #5065DB 30%, #7C4DFF 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textFillColor: "transparent",
              }}
            >
              Ready to Transform Your Study Habits?
            </Typography>
          </Zoom>
          
          <Fade in={animate} timeout={1000}>
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
              Join thousands of students who are already studying smarter, not harder.
              Get started today and see the difference in your academic performance!
            </Typography>
          </Fade>
          
       
          <Box
            sx={{
              display: "flex",
              gap: { xs: 2, sm: 3 },
              justifyContent: "center",
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Button
              variant="contained"
              size="large"
              href="/sign-up"
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: { xs: 4, sm: 5 },
                py: { xs: 1.5, sm: 1.75 },
                fontSize: { xs: "1.1rem", sm: "1.2rem" },
                width: { xs: "100%", sm: "auto" },
                borderRadius: "12px",
                background: "linear-gradient(45deg, #5065DB 30%, #7C4DFF 90%)",
                boxShadow: "0 8px 20px rgba(80, 101, 219, 0.25)",
                textTransform: "none",
                fontWeight: 600,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 10px 25px rgba(80, 101, 219, 0.4)",
                },
              }}
            >
              Get Started Free
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              href="/features"
              sx={{
                px: { xs: 4, sm: 5 },
                py: { xs: 1.5, sm: 1.75 },
                fontSize: { xs: "1.1rem", sm: "1.2rem" },
                width: { xs: "100%", sm: "auto" },
                borderRadius: "12px",
                borderWidth: "2px",
                borderColor: "#5065DB",
                textTransform: "none",
                fontWeight: 600,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderWidth: "2px",
                  transform: "translateY(-3px)",
                  boxShadow: "0 6px 15px rgba(80, 101, 219, 0.15)",
                },
              }}
            >
              Learn More
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: { xs: 6, sm: 8 },
          borderTop: "1px solid rgba(80, 101, 219, 0.1)",
          mt: { xs: 4, sm: 6 },
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <SchoolIcon sx={{ 
                fontSize: "2rem", 
                color: "#5065DB",
                mr: 1.5,
              }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  background: "linear-gradient(45deg, #5065DB 30%, #7C4DFF 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textFillColor: "transparent",
                }}
              >
                StudyMate
              </Typography>
            </Box>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                mb: 2,
              }}
            >
              AI-powered study tools to help you learn faster and remember longer.
            </Typography>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: "#263238",
              }}
            >
              Product
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              {['Features', 'Pricing', 'Examples', 'Updates'].map((item) => (
                <Box component="li" key={item} sx={{ mb: 1 }}>
                  <Typography
                    component="a"
                    href="#"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.95rem",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                      "&:hover": {
                        color: "#5065DB",
                      },
                    }}
                  >
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: "#263238",
              }}
            >
              Resources
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              {['Blog', 'Guides', 'Help Center', 'Support'].map((item) => (
                <Box component="li" key={item} sx={{ mb: 1 }}>
                  <Typography
                    component="a"
                    href="#"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.95rem",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                      "&:hover": {
                        color: "#5065DB",
                      },
                    }}
                  >
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4} md={4}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: "#263238",
              }}
            >
              Stay Updated
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                mb: 2,
              }}
            >
              Subscribe to our newsletter for the latest updates and tips.
            </Typography>
            <Box 
              component="form" 
              sx={{ 
                display: "flex", 
                gap: 1,
                maxWidth: "400px",
              }}
            >
              <Box
                component="input"
                placeholder="Your email"
                sx={{
                  flexGrow: 1,
                  px: 2,
                  py: 1.5,
                  borderRadius: "8px",
                  border: "1px solid rgba(80, 101, 219, 0.3)",
                  fontSize: "0.95rem",
                  outline: "none",
                  transition: "all 0.2s ease",
                  "&:focus": {
                    borderColor: "#5065DB",
                    boxShadow: "0 0 0 3px rgba(80, 101, 219, 0.2)",
                  },
                }}
              />
              <Button
                variant="contained"
                size="small"
                sx={{
                  px: 3,
                  borderRadius: "8px",
                  background: "linear-gradient(45deg, #5065DB 30%, #7C4DFF 90%)",
                  textTransform: "none",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        <Box
          sx={{
            mt: { xs: 6, sm: 8 },
            pt: 4,
            borderTop: "1px solid rgba(80, 101, 219, 0.1)",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            sx={{
              color: "text.secondary",
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