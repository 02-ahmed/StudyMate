"use client";

import { useState, useEffect } from "react";
import { IconButton, Tooltip, Box } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopIcon from "@mui/icons-material/Stop";
import { isSpeechSupported, speakText, stopSpeech } from "@/utils/textToSpeech";
import useTranslation from "../hooks/useTranslation";

/**
 * A reusable component that adds text-to-speech functionality
 *
 * @param {Object} props - Component props
 * @param {string} props.text - The text to be spoken
 * @param {string} props.language - The language code (e.g., 'en', 'fr')
 * @param {string} props.tooltipText - Custom tooltip text (optional)
 * @param {string} props.ariaLabel - Custom aria label (optional)
 * @param {Object} props.sx - Additional MUI styles for the component
 * @param {Function} props.onStart - Callback when speech starts (optional)
 * @param {Function} props.onEnd - Callback when speech ends (optional)
 */
export default function TextToSpeech({
  text,
  language = "en",
  tooltipText,
  ariaLabel,
  sx = {},
  onStart,
  onEnd,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Check on client-side only
    setSpeechSupported(isSpeechSupported());
  }, []);

  // Clean up and stop speaking when component unmounts
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        stopSpeech();
      }
    };
  }, [isSpeaking]);

  // Handle speak button click
  const handleSpeak = (event) => {
    // Stop event propagation to prevent parent elements from handling the click
    if (event) {
      event.stopPropagation();
    }

    if (!speechSupported || !text) return;

    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      onEnd && onEnd();
    } else {
      speakText(
        text,
        language,
        () => {
          setIsSpeaking(true);
          onStart && onStart();
        },
        () => {
          setIsSpeaking(false);
          onEnd && onEnd();
        },
        () => {
          setIsSpeaking(false);
          onEnd && onEnd();
        }
      );
    }
  };

  if (!speechSupported) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...sx,
      }}
    >
      <Tooltip
        title={
          tooltipText ||
          (isSpeaking
            ? t("accessibility.textToSpeech.stopListening", "Stop")
            : t("accessibility.textToSpeech.listen", "Listen"))
        }
      >
        <IconButton
          size="small"
          onClick={handleSpeak}
          aria-label={
            ariaLabel ||
            (isSpeaking
              ? t("accessibility.textToSpeech.stopListening", "Stop")
              : t("accessibility.textToSpeech.listen", "Listen"))
          }
          color={isSpeaking ? "primary" : "default"}
        >
          {isSpeaking ? (
            <StopIcon fontSize="small" />
          ) : (
            <VolumeUpIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
