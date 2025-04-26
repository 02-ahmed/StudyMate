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
      const response = await fetch("/api/generate-review-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setContent({
        introduction: data.introduction || "",
        conceptExplanation: data.conceptExplanation || "",
        relatedConcepts: data.relatedConcepts || "",
        resources: data.resources || { articles: [], videos: [] },
      });
    } catch (error) {
      console.error("Error generating content:", error);
      setContent({
        introduction: "Error generating content. Please try again later.",
        conceptExplanation: error.message,
        relatedConcepts: "",
        resources: { articles: [], videos: [] },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTopicChange = (_, newTopic) => {
    setCurrentTopic(typeof newTopic === "string" ? newTopic : newTopic.topic);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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
      </motion.div>
    </Container>
  );
}
