import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";
import ImageIcon from "@mui/icons-material/Image";
import TextFieldsIcon from "@mui/icons-material/TextFields";

const Flashcard = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const onAnswer = (isCorrect) => {
    // Handle answer logic
  };

  const generateImage = async (e) => {
    e.stopPropagation(); // Prevent card from flipping

    // If image is already loaded, toggle between image and text view
    if (imageData) {
      setShowImage(!showImage);
      return;
    }

    setLoadingImage(true);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          front: card.front || card.question,
          back: card.back || card.answer,
        }),
      });

      const data = await response.json();

      if (data.imageData) {
        setImageData(data.imageData);
        setShowImage(true);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoadingImage(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ perspective: 1500 }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 70 }}
        style={{ transformStyle: "preserve-3d" }}
        onClick={handleFlip}
      >
        <Card
          sx={{
            minHeight: showImage && imageData ? 400 : 300,
            width: "100%",
            position: "relative",
            cursor: "pointer",
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(63, 81, 181, 0.15)",
            borderRadius: 4,
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 48px rgba(63, 81, 181, 0.2)",
            },
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
              borderRadius: 4,
              zIndex: 0,
            }}
          />
          <CardContent
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
              position: "relative",
              zIndex: 1,
              backfaceVisibility: "hidden",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <Typography
              variant="h5"
              component="div"
              sx={{
                mb: 2,
                textAlign: "center",
                fontWeight: 600,
                color: "#1a237e",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {isFlipped ? "Answer" : "Question"}
            </Typography>

            {showImage && imageData ? (
              <Box
                sx={{
                  mb: 2,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <img
                  src={`data:image/png;base64,${imageData}`}
                  alt="Flashcard visualization"
                  style={{
                    width: "100%",
                    maxHeight: "280px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
              </Box>
            ) : (
              <Typography
                variant="body1"
                sx={{
                  textAlign: "center",
                  color: "text.primary",
                  fontSize: "1.1rem",
                  lineHeight: 1.6,
                }}
              >
                {isFlipped
                  ? card.back || card.answer
                  : card.front || card.question}
              </Typography>
            )}

            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                right: 16,
                display: "flex",
                gap: 1,
              }}
            >
              {card.canVisualize && (
                <Tooltip
                  title={
                    loadingImage
                      ? "Generating image..."
                      : imageData
                      ? showImage
                        ? "Show text"
                        : "Show image"
                      : "Generate image"
                  }
                >
                  <IconButton
                    size="small"
                    onClick={generateImage}
                    sx={{
                      bgcolor: showImage
                        ? "rgba(63, 81, 181, 0.2)"
                        : "rgba(63, 81, 181, 0.1)",
                      "&:hover": {
                        bgcolor: "rgba(63, 81, 181, 0.2)",
                      },
                    }}
                    disabled={loadingImage}
                  >
                    {loadingImage ? (
                      <CircularProgress size={20} />
                    ) : showImage && imageData ? (
                      <TextFieldsIcon />
                    ) : (
                      <ImageIcon />
                    )}
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Flip card">
                <IconButton
                  size="small"
                  onClick={handleFlip}
                  sx={{
                    bgcolor: "rgba(63, 81, 181, 0.1)",
                    "&:hover": {
                      bgcolor: "rgba(63, 81, 181, 0.2)",
                    },
                  }}
                >
                  <FlipCameraAndroidIcon />
                </IconButton>
              </Tooltip>
              {isFlipped && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => onAnswer(false)}
                      startIcon={<CloseIcon />}
                      sx={{
                        background:
                          "linear-gradient(135deg, #f44336 0%, #e57373 100%)",
                        boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)",
                        },
                      }}
                    >
                      Incorrect
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => onAnswer(true)}
                      startIcon={<CheckIcon />}
                      sx={{
                        background:
                          "linear-gradient(135deg, #4caf50 0%, #81c784 100%)",
                        boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
                        },
                      }}
                    >
                      Correct
                    </Button>
                  </Box>
                </motion.div>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Flashcard;
