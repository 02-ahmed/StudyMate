import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import {
  SchoolIcon,
  StyleIcon,
  AccessTimeIcon,
  PlayArrowIcon,
  EditIcon,
} from "@mui/icons-material";

const FlashcardDeck = ({
  deck,
  estimatedTime,
  handleStartStudy,
  handleEditDeck,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          borderRadius: 4,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(63, 81, 181, 0.15)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(121, 134, 203, 0.05) 100%)",
            zIndex: 0,
          }}
        />
        <CardContent sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <SchoolIcon
              sx={{
                fontSize: 40,
                color: "#3f51b5",
                filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))",
                mr: 2,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                background: "linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {deck.title}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                mb: 2,
                textShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              {deck.description}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Chip
                icon={<StyleIcon />}
                label={`${deck.cards.length} Cards`}
                sx={{
                  background:
                    "linear-gradient(135deg, #3f51b5 0%, #7986cb 100%)",
                  color: "white",
                  fontWeight: 500,
                  boxShadow: "0 4px 12px rgba(63, 81, 181, 0.2)",
                }}
              />
              <Chip
                icon={<AccessTimeIcon />}
                label={`${estimatedTime} min`}
                sx={{
                  background:
                    "linear-gradient(135deg, #3f51b5 0%, #7986cb 100%)",
                  color: "white",
                  fontWeight: 500,
                  boxShadow: "0 4px 12px rgba(63, 81, 181, 0.2)",
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              onClick={handleStartStudy}
              startIcon={<PlayArrowIcon />}
              sx={{
                background: "linear-gradient(135deg, #4caf50 0%, #81c784 100%)",
                color: "white",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(76, 175, 80, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 40px rgba(76, 175, 80, 0.4)",
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              Start Studying
            </Button>
            <Button
              variant="outlined"
              onClick={handleEditDeck}
              startIcon={<EditIcon />}
              sx={{
                borderColor: "#3f51b5",
                color: "#3f51b5",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                "&:hover": {
                  borderColor: "#3f51b5",
                  background: "rgba(63, 81, 181, 0.05)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              Edit Deck
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FlashcardDeck;
