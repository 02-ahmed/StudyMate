"use client";

import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  Button,
  ListItemText,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import YouTubeIcon from "@mui/icons-material/YouTube";

export default function ResourcesSection({ resources, type = "academic" }) {
  if (!resources || resources.length === 0) return null;

  const icon =
    type === "academic" ? (
      <ArticleIcon color="primary" />
    ) : (
      <YouTubeIcon color="primary" />
    );
  const title = type === "academic" ? "Study Resources" : "Video Resources";

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
        {icon}
        <Typography variant="h6" color="primary">
          {title}
        </Typography>
      </Box>

      <List>
        {resources.map((resource, index) => (
          <ListItem
            key={index}
            sx={{
              bgcolor: "white",
              mb: 1,
              borderRadius: 2,
              "&:hover": {
                bgcolor: "rgba(63, 81, 181, 0.05)",
              },
            }}
          >
            <ListItemText
              primary={resource.title}
              secondary={resource.description}
              sx={{
                "& .MuiListItemText-primary": {
                  fontWeight: 500,
                  color: "primary.main",
                },
              }}
            />
            <Button
              variant="outlined"
              size="small"
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {type === "academic" ? "Read" : "Watch"}
            </Button>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
