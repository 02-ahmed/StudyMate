"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Button,
  Grid,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ArticleIcon from "@mui/icons-material/Article";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function ReviewContent() {
  const searchParams = useSearchParams();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({
    introduction: "",
    conceptExplanation: "",
    relatedConcepts: "",
    resources: { articles: [], videos: [] },
  });
  const [currentTopic, setCurrentTopic] = useState("");

  useEffect(() => {
    const topicsParam = searchParams.get("topics");
    if (topicsParam) {
      try {
        const decodedTopics = JSON.parse(decodeURIComponent(topicsParam));
        setTopics(decodedTopics);
        if (decodedTopics.length > 0) {
          setCurrentTopic(decodedTopics[0]);
        }
      } catch (error) {
        console.error("Error parsing topics:", error);
      }
    }
    setLoading(false);
  }, [searchParams]);

  useEffect(() => {
    if (currentTopic) {
      generateContent(currentTopic);
    }
  }, [currentTopic]);

  const generateContent = async (topic) => {
    try {
      setLoading(true);
      console.log("Generating content for topic:", topic);

      const response = await fetch("/api/generate-review-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (!response.ok) {
        throw new Error(`Server error: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log("Parsed data:", data);
      setContent(data);
      setLoading(false);
    } catch (error) {
      console.error("Error generating content:", error);
      setContent({
        introduction: "Error generating content. Please try again later.",
        conceptExplanation: error.message,
        relatedConcepts: "",
        resources: { articles: [], videos: [] },
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
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
            Review these frequently missed topics
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", mt: 1, color: "text.secondary" }}
          >
            Topics to review:
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {topics.map((topic, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: "#f8f9ff",
                  borderRadius: 2,
                  p: 3,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#1a237e",
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      mb: 0.5,
                    }}
                  >
                    {topic}
                  </Typography>
                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.875rem",
                    }}
                  >
                    {topic.questions || 0} questions
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleTopicChange(null, topic)}
                  sx={{
                    minWidth: "fit-content",
                    whiteSpace: "nowrap",
                  }}
                >
                  Study Now
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>

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
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
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
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
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
    </Container>
  );
}
