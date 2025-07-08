"use client";

import { useState } from "react";
import {
  Box,
  Fab,
  Badge,
  Tooltip,
  Collapse,
  Paper,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
} from "@mui/material";
import {
  Timer as TimerIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Fullscreen as ExpandIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { usePomodoro } from "../../contexts/PomodoroContext";
import useTranslation from "../../hooks/useTranslation";

export default function PomodoroWidget({ onOpenModal }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    formattedTime,
    isActive,
    isPaused,
    mode,
    currentMode,
    progress,
    completedSessions,
    workSessionsInCycle,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  } = usePomodoro();

  const isRunning = isActive && !isPaused;
  const showBadge = isRunning || completedSessions > 0;

  const handleToggleTimer = (e) => {
    e.stopPropagation();
    if (isActive && !isPaused) {
      pauseTimer();
    } else if (isPaused) {
      resumeTimer();
    } else {
      startTimer();
    }
  };

  const handleReset = (e) => {
    e.stopPropagation();
    resetTimer();
  };

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleOpenModal = () => {
    setIsExpanded(false);
    onOpenModal();
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 80, sm: 24 },
        right: { xs: 16, sm: 24 },
        zIndex: 1300,
      }}
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            style={{ marginBottom: 16 }}
          >
            <Paper
              elevation={8}
              sx={{
                p: 2,
                minWidth: 280,
                borderRadius: 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Background pattern */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.1,
                  background:
                    "radial-gradient(circle at 30% 20%, white 2px, transparent 2px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)",
                  backgroundSize: "20px 20px, 30px 30px",
                }}
              />

              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                  position: "relative",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={t(
                      `pomodoro.${mode.toLowerCase()}`,
                      currentMode.label
                    )}
                    size="small"
                    sx={{
                      backgroundColor: currentMode.color,
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  />
                  {workSessionsInCycle > 0 && mode !== "WORK" && (
                    <Chip
                      label={`${workSessionsInCycle}/4`}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: "rgba(255,255,255,0.5)",
                        color: "white",
                        fontSize: "0.7rem",
                      }}
                    />
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={handleOpenModal}
                  sx={{ color: "white", opacity: 0.8 }}
                >
                  <ExpandIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Timer display */}
              <Box sx={{ textAlign: "center", mb: 2, position: "relative" }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    fontFamily: "monospace",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    mb: 1,
                  }}
                >
                  {formattedTime}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: currentMode.color,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              {/* Controls */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                  position: "relative",
                }}
              >
                <IconButton
                  onClick={handleToggleTimer}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  {isRunning ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
                <IconButton
                  onClick={handleReset}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  <StopIcon />
                </IconButton>
              </Box>

              {/* Session count */}
              {completedSessions > 0 && (
                <Box sx={{ textAlign: "center", mt: 1, position: "relative" }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {t("pomodoro.completedSessions", "Sessions completed")}:{" "}
                    {completedSessions}
                  </Typography>
                </Box>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <Tooltip
        title={
          isRunning
            ? `${t("pomodoro.running", "Running")}: ${formattedTime}`
            : t("pomodoro.timer", "Pomodoro Timer")
        }
        placement="left"
      >
        <Badge
          badgeContent={showBadge ? (isRunning ? "⏱️" : completedSessions) : 0}
          color={isRunning ? "error" : "primary"}
          overlap="circular"
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <Fab
            onClick={handleExpandToggle}
            sx={{
              background: isRunning
                ? `linear-gradient(45deg, ${currentMode.color}, #e91e63)`
                : "linear-gradient(45deg, #667eea, #764ba2)",
              color: "white",
              boxShadow: isRunning
                ? "0 0 20px rgba(233, 30, 99, 0.5)"
                : "0 4px 20px rgba(0,0,0,0.3)",
              "&:hover": {
                background: isRunning
                  ? `linear-gradient(45deg, ${currentMode.color}, #e91e63)`
                  : "linear-gradient(45deg, #667eea, #764ba2)",
                transform: "scale(1.1)",
              },
              transition: "all 0.3s ease",
              animation: isRunning ? "pulse 2s infinite" : "none",
              "@keyframes pulse": {
                "0%": {
                  transform: "scale(1)",
                  boxShadow: `0 0 20px rgba(233, 30, 99, 0.5)`,
                },
                "50%": {
                  transform: "scale(1.05)",
                  boxShadow: `0 0 30px rgba(233, 30, 99, 0.8)`,
                },
                "100%": {
                  transform: "scale(1)",
                  boxShadow: `0 0 20px rgba(233, 30, 99, 0.5)`,
                },
              },
            }}
          >
            <TimerIcon />
          </Fab>
        </Badge>
      </Tooltip>
    </Box>
  );
}
