"use client";

import { Box, Typography, Paper } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

export default function NotesSection({ content }) {
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
        <SchoolIcon color="primary" />
        <Typography variant="h6" color="primary">
          Detailed Notes
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
