"use client";

import { Box, Typography, Paper, List, ListItem, Divider } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useLanguage } from "../../contexts/LanguageContext";
import useTranslation from "../../hooks/useTranslation";

export default function PracticeSection({ content }) {
  const { t } = useTranslation();

  if (!content) return null;

  // Handle the case where content is an object with questions array
  const hasQuestions =
    content && content.questions && Array.isArray(content.questions);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: "rgba(63, 81, 181, 0.03)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <AssignmentIcon color="primary" />
        <Typography variant="h6" color="primary">
          {t("titles.practiceMaterials", "Practice Materials")}
        </Typography>
      </Box>

      {hasQuestions ? (
        <List sx={{ p: 0 }}>
          {content.questions.map((item, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {index + 1}. {item.question}
              </Typography>
              <Typography sx={{ ml: 3, mt: 1, whiteSpace: "pre-wrap" }}>
                {item.answer}
              </Typography>
              {index < content.questions.length - 1 && (
                <Divider sx={{ my: 2 }} />
              )}
            </Box>
          ))}
        </List>
      ) : (
        <Typography
          component="div"
          sx={{
            "& > *": { mb: 1 },
            whiteSpace: "pre-wrap",
            lineHeight: 1.7,
          }}
        >
          {typeof content === "string" ? content : JSON.stringify(content)}
        </Typography>
      )}
    </Paper>
  );
}
