"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ArticleIcon from "@mui/icons-material/Article";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function ReviewContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [currentTopic, setCurrentTopic] = useState("");
  const [topics, setTopics] = useState([]);
  const [content, setContent] = useState({
    introduction: "",
    conceptExplanation: "",
    relatedConcepts: "",
    resources: { articles: [], videos: [] },
  });

  useEffect(() => {
    const topicsParam = searchParams.get("topics");
    if (topicsParam) {
      const parsedTopics = JSON.parse(decodeURIComponent(topicsParam));
      setTopics(parsedTopics);
      if (parsedTopics.length > 0) {
        setCurrentTopic(parsedTopics[0]);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentTopic) {
      generateContent(currentTopic);
    }
  }, [currentTopic]);

  const generateContent = async (topic) => {
    try {
      setLoading(true);
      const genAI = new GoogleGenerativeAI(
        process.env.NEXT_PUBLIC_GOOGLE_API_KEY
      );
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
        I need a comprehensive learning guide about ${topic}.
        Please provide:

        1. Introduction:
        - Basic overview of the field/subject this topic belongs to
        - Why this topic is important
        - Prerequisites for understanding this topic

        2. Main Concept Explanation:
        - Detailed explanation of ${topic}
        - Key principles and components
        - Common applications
        - Visual descriptions (if applicable)

        3. Related Concepts:
        - Connected topics and their relationships
        - How this fits into the broader subject
        - Progressive learning path

        4. Learning Resources:
        - Key terms for finding educational content
        - Suggested topics for further reading
        - Specific concepts to search for in educational videos

        Format the response with clear sections and bullet points.
      `;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Parse the response into sections
      const sections = response.split(/\d\.\s+/);

      // Structure the content
      const structuredContent = {
        introduction: sections[1] || "",
        conceptExplanation: sections[2] || "",
        relatedConcepts: sections[3] || "",
        resources: {
          articles: [
            {
              title: `Introduction to ${topic}`,
              url: `https://scholar.google.com/scholar?q=introduction+${encodeURIComponent(
                topic
              )}`,
            },
            {
              title: `Advanced ${topic} Concepts`,
              url: `https://scholar.google.com/scholar?q=advanced+${encodeURIComponent(
                topic
              )}`,
            },
          ],
          videos: [
            {
              title: `${topic} Basics`,
              url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
                topic
              )}+tutorial`,
            },
            {
              title: `${topic} Explained`,
              url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
                topic
              )}+explained`,
            },
          ],
        },
      };

      setContent(structuredContent);
      setLoading(false);
    } catch (error) {
      console.error("Error generating content:", error);
      setLoading(false);
    }
  };

  const handleTopicChange = (_, newTopic) => {
    setCurrentTopic(newTopic);
  };

  if (!topics.length) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>No topics to review</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
            }}
          >
            Review Mode
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", mt: 1, color: "text.secondary" }}
          >
            Deep dive into concepts you need to improve
          </Typography>
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={currentTopic}
            onChange={handleTopicChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "1rem",
              },
            }}
          >
            {topics.map((topic) => (
              <Tab key={topic} label={topic} value={topic} />
            ))}
          </Tabs>
        </Paper>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SchoolIcon color="primary" />
                      <Typography variant="h6">Introduction</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography component="div" sx={{ whiteSpace: "pre-wrap" }}>
                      {content.introduction}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SchoolIcon color="primary" />
                      <Typography variant="h6">Main Concept</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography component="div" sx={{ whiteSpace: "pre-wrap" }}>
                      {content.conceptExplanation}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SchoolIcon color="primary" />
                      <Typography variant="h6">Related Concepts</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography component="div" sx={{ whiteSpace: "pre-wrap" }}>
                      {content.relatedConcepts}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <ArticleIcon color="primary" />
                      <Typography variant="h6">Related Articles</Typography>
                    </Box>
                    <List>
                      {content.resources.articles.map((article, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            bgcolor: "background.paper",
                            mb: 1,
                            borderRadius: 1,
                          }}
                        >
                          <ListItemText primary={article.title} />
                          <Button
                            variant="outlined"
                            size="small"
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Read
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <YouTubeIcon color="primary" />
                      <Typography variant="h6">Video Resources</Typography>
                    </Box>
                    <List>
                      {content.resources.videos.map((video, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            bgcolor: "background.paper",
                            mb: 1,
                            borderRadius: 1,
                          }}
                        >
                          <ListItemText primary={video.title} />
                          <Button
                            variant="outlined"
                            size="small"
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Watch
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </motion.div>
    </Container>
  );
}
