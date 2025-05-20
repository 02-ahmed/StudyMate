"use client";

import { Box, Typography, Paper } from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { useLanguage } from "../../contexts/LanguageContext";
import useTranslation from "../../hooks/useTranslation";

export default function ExplanationsSection({ content }) {
  const { t } = useTranslation();

  if (!content) return null;

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
        <LightbulbIcon color="primary" />
        <Typography variant="h6" color="primary">
          {t("titles.inDepthExplanations", "In-Depth Explanations")}
        </Typography>
      </Box>

      <Typography
        component="div"
        sx={{
          "& > *": { mb: 1 },
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
        }}
      >
        {content}
      </Typography>
    </Paper>
  );
}
