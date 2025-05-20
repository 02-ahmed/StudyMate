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
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ArticleIcon from "@mui/icons-material/Article";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TranslateIcon from "@mui/icons-material/Translate";
import {
  useLanguage,
  SUPPORTED_LANGUAGES,
} from "../../contexts/LanguageContext";
import useTranslation from "../../hooks/useTranslation";

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
  const { language } = useLanguage();
  const { t } = useTranslation();

  console.log("=== REVIEW CONTENT COMPONENT INITIALIZED ===");
  console.log("UI Language context:", language);
  console.log("Search params:", Object.fromEntries(searchParams.entries()));

  useEffect(() => {
    console.log("=== REVIEW CONTENT TOPICS EFFECT TRIGGERED ===");
    const topicsParam = searchParams.get("topics");
    console.log("Raw topics param:", topicsParam);

    if (topicsParam) {
      try {
        const decodedTopics = JSON.parse(decodeURIComponent(topicsParam));
        console.log("Decoded topics from URL:", decodedTopics);
        console.log("Raw topics param from URL:", topicsParam);
        console.log("Decoded topics[0]:", decodedTopics[0]);
        console.log(
          "All properties in decoded topics[0]:",
          Object.getOwnPropertyNames(decodedTopics[0])
        );
        console.log(
          "All values in decoded topics[0]:",
          Object.values(decodedTopics[0])
        );
        console.log(
          "JSON stringified topics[0]:",
          JSON.stringify(decodedTopics[0])
        );

        // Check if language property exists in the topic
        console.log("========== TOPIC LANGUAGE CHECK ==========");
        console.log(
          "Topic has language property:",
          "language" in decodedTopics[0]
        );
        console.log("Topic language value:", decodedTopics[0].language);
        console.log(
          "Topic language value (quoted):",
          `"${decodedTopics[0].language}"`
        );
        console.log("Topic language type:", typeof decodedTopics[0].language);
        console.log(
          "Is topic language null?",
          decodedTopics[0].language === null
        );
        console.log(
          "Is topic language undefined?",
          decodedTopics[0].language === undefined
        );
        console.log(
          "Is topic language empty string?",
          decodedTopics[0].language === ""
        );
        console.log(
          "Topic language string length:",
          decodedTopics[0].language ? decodedTopics[0].language.length : 0
        );
        console.log(
          "Topic language in SUPPORTED_LANGUAGES:",
          decodedTopics[0].language in SUPPORTED_LANGUAGES
        );
        console.log("Supported languages:", Object.keys(SUPPORTED_LANGUAGES));
        console.log("==========================================");

        setTopics(decodedTopics);
        if (decodedTopics.length > 0) {
          setCurrentTopic(decodedTopics[0]);
          console.log("Set current topic:", decodedTopics[0]);
          console.log("Topic language:", decodedTopics[0].language);
          console.log("Topic language type:", typeof decodedTopics[0].language);
          console.log("Is language null?", decodedTopics[0].language === null);
          console.log(
            "Is language undefined?",
            decodedTopics[0].language === undefined
          );
          console.log(
            "Topic language value:",
            JSON.stringify(decodedTopics[0].language)
          );
          console.log("Topic language exists?", "language" in decodedTopics[0]);
        }
      } catch (error) {
        console.error("Error parsing topics:", error);
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
      }
    } else {
      console.log("No topics parameter found in URL");
    }
    setLoading(false);
  }, [searchParams]);

  // Check if language parameter is in URL and set it as the active language
  useEffect(() => {
    console.log("=== REVIEW CONTENT LANGUAGE EFFECT TRIGGERED ===");
    const urlLanguage = searchParams.get("language");
    console.log("URL language parameter:", urlLanguage);

    if (urlLanguage && SUPPORTED_LANGUAGES[urlLanguage]) {
      console.log(`Language parameter found in URL: ${urlLanguage}`);
      // If URL has a language parameter that's different from the current context language,
      // we should update our local state to use this language
      if (urlLanguage !== language) {
        console.log(
          `URL language (${urlLanguage}) is different from context language (${language})`
        );
        // We'll use this URL language for content generation
      }
    } else {
      console.log(
        `No valid language parameter in URL. Using context language: ${language}`
      );
    }
  }, [searchParams, language]);

  useEffect(() => {
    console.log("=== GENERATE CONTENT EFFECT TRIGGERED ===");
    console.log("Current topic:", currentTopic);
    console.log("Language:", language);

    if (currentTopic) {
      console.log("Calling generateContent with:", currentTopic);
      generateContent(currentTopic);
    } else {
      console.log("No current topic set, skipping content generation");
    }
  }, [currentTopic, language, searchParams]);

  const generateContent = async (topic) => {
    console.log("=== GENERATE CONTENT FUNCTION CALLED ===");
    console.log("Topic parameter:", topic);
    console.log("Topic parameter type:", typeof topic);

    try {
      setLoading(true);

      // Get the topic object
      const topicObj = typeof topic === "string" ? { topic } : topic;

      console.log("Topic object:", topicObj);
      console.log("Topic object type:", typeof topicObj);
      console.log("Topic object keys:", Object.keys(topicObj));
      console.log("Topic object stringified:", JSON.stringify(topicObj));
      console.log("Topic object language:", topicObj.language);
      console.log("Topic object language (quoted):", `"${topicObj.language}"`);
      console.log("Topic object language type:", typeof topicObj.language);
      console.log(
        "Topic object language value:",
        JSON.stringify(topicObj.language)
      );
      console.log("Is topic object language null?", topicObj.language === null);
      console.log(
        "Is topic object language undefined?",
        topicObj.language === undefined
      );
      console.log(
        "Is topic object language empty string?",
        topicObj.language === ""
      );
      console.log(
        "Topic object language string length:",
        topicObj.language ? topicObj.language.length : 0
      );

      // IMPORTANT: Use ONLY the language from the topic object
      // This comes directly from the flashcard set's language
      // Do NOT fall back to UI context language
      let contentLanguage = topicObj.language;
      console.log("Content language from topic:", contentLanguage);
      console.log("Content language (quoted):", `"${contentLanguage}"`);
      console.log("Content language type:", typeof contentLanguage);
      console.log("Is content language null?", contentLanguage === null);
      console.log(
        "Is content language undefined?",
        contentLanguage === undefined
      );
      console.log("Is content language empty string?", contentLanguage === "");
      console.log(
        "Content language string length:",
        contentLanguage ? contentLanguage.length : 0
      );
      console.log(
        "Content language in SUPPORTED_LANGUAGES:",
        contentLanguage in SUPPORTED_LANGUAGES
      );

      // If no language is specified, API will handle the default
      // We're not setting any fallbacks here to ensure we use ONLY what comes from the flashcard set

      console.log("Final content language:", contentLanguage);

      console.log(
        `Generating content for topic "${topicObj.topic}" in language: ${contentLanguage}`
      );

      // IMPORTANT FIX: Ensure language is explicitly included in the request body
      // Only include the language if it's a non-empty string
      const requestBody = {
        topic: topicObj.topic,
      };

      // Only add language if it's a valid string
      if (typeof contentLanguage === "string" && contentLanguage) {
        requestBody.language = contentLanguage;
        console.log("Added language to request body:", contentLanguage);
      } else {
        console.log(
          "Language not added to request body because it's not a valid string"
        );
        console.log("Language value:", contentLanguage);
        console.log("Language type:", typeof contentLanguage);
      }

      console.log("========== API REQUEST BODY ==========");
      console.log("API request body:", JSON.stringify(requestBody));
      console.log("API request body keys:", Object.keys(requestBody));
      console.log("API request body language:", requestBody.language);
      console.log(
        "API request body language (quoted):",
        `"${requestBody.language}"`
      );
      console.log(
        "API request body language type:",
        typeof requestBody.language
      );
      console.log(
        "Is request body language null?",
        requestBody.language === null
      );
      console.log(
        "Is request body language undefined?",
        requestBody.language === undefined
      );
      console.log(
        "Is request body language empty string?",
        requestBody.language === ""
      );
      console.log(
        "Request body language string length:",
        requestBody.language ? requestBody.language.length : 0
      );
      console.log(
        "Is language property in request body?",
        "language" in requestBody
      );
      console.log("======================================");

      // Get user ID from client-side if available
      // Try multiple sources to ensure we get a user ID
      let userId;
      try {
        // First try window.clerkUserInfo
        if (window.clerkUserInfo && window.clerkUserInfo.id) {
          userId = window.clerkUserInfo.id;
          console.log("Retrieved user ID from window.clerkUserInfo:", userId);
        }
        // Then try localStorage
        else if (typeof localStorage !== "undefined") {
          userId = localStorage.getItem("userId");
          console.log(
            "Retrieved user ID from localStorage:",
            userId || "not found"
          );
        }
      } catch (error) {
        console.error("Error retrieving user ID:", error);
      }

      console.log("Final user ID for API call:", userId || "not available");

      // Log the headers we're sending for debugging
      const headers = {
        "Content-Type": "application/json",
        "x-user-id": userId || "",
      };

      console.log("API request headers:", headers);

      const response = await fetch("/api/generate-review-content", {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log("API response status:", response.status);
      console.log("API response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      console.log("API response data keys:", Object.keys(data));

      if (data.error) {
        console.error("API returned error:", data.error);
        throw new Error(data.error);
      }

      // Map the API response to the content structure
      // The API returns data.sections which contains the content fields
      const sections = data.sections || {};
      console.log("API sections keys:", Object.keys(sections));

      console.log(
        "Received API response. Content language should be:",
        contentLanguage
      );
      console.log(
        "First 50 chars of content:",
        sections.detailedNotes?.substring(0, 50) || "No content"
      );

      setContent({
        introduction: sections.detailedNotes || "",
        conceptExplanation: sections.explanations || "",
        relatedConcepts: sections.practiceContent || "",
        resources: {
          articles: sections.studyResources || [],
          videos: sections.videoContent || [],
        },
      });

      console.log("Content set successfully in language:", contentLanguage);
    } catch (error) {
      console.error("Error in generateContent:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
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
    console.log("=== HANDLE TOPIC CHANGE CALLED ===");
    console.log("New topic:", newTopic);
    const topicToSet = typeof newTopic === "string" ? newTopic : newTopic.topic;
    console.log("Setting current topic to:", topicToSet);
    setCurrentTopic(topicToSet);
  };

  if (loading) {
    console.log("Review content in loading state");
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  console.log("Review content rendering with data");
  console.log("Content introduction length:", content.introduction.length);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("titles.review", "Review Mode")}
          </Typography>

          <Chip
            icon={<TranslateIcon />}
            label={SUPPORTED_LANGUAGES[language] || "English"}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>

        <Typography
          variant="body1"
          sx={{ textAlign: "center", mt: 1, mb: 4, color: "text.secondary" }}
        >
          {t(
            "review.description",
            "Deep dive into concepts you need to improve"
          )}
        </Typography>

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
            {t(
              "dashboard.performance.reviewTopics",
              "Review these frequently missed topics"
            )}
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", mt: 1, color: "text.secondary" }}
          >
            {t("dashboard.performance.topicsToReview", "Topics to review:")}
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
                    {typeof topic === "string" ? topic : topic.topic}
                  </Typography>
                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.875rem",
                    }}
                  >
                    {typeof topic === "string" ? "0" : topic.questions || 0}{" "}
                    questions
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
                  {t("dashboard.performance.studyNow", "Study Now")}
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
                  <Typography variant="h6">
                    {t("review.introduction", "Introduction")}
                  </Typography>
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
                  <Typography variant="h6">
                    {t("review.mainConcept", "Main Concept")}
                  </Typography>
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
                  <Typography variant="h6">
                    {t("review.relatedConcepts", "Related Concepts")}
                  </Typography>
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
                  <Typography variant="h6">
                    {t("review.relatedArticles", "Related Articles")}
                  </Typography>
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
                        {t("buttons.read", "Read")}
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
                  <Typography variant="h6">
                    {t("review.videoResources", "Video Resources")}
                  </Typography>
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
                        {t("buttons.watch", "Watch")}
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
