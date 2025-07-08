"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Slider,
  Switch,
  FormControlLabel,
  Paper,
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  SkipNext as SkipIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Timer as TimerIcon,
  Coffee as CoffeeIcon,
  FreeBreakfast as LongBreakIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { usePomodoro } from "../../contexts/PomodoroContext";
import useTranslation from "../../hooks/useTranslation";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pomodoro-tabpanel-${index}`}
      aria-labelledby={`pomodoro-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PomodoroModal({ open, onClose }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    notifications: true,
  });

  const {
    formattedTime,
    timeLeft,
    isActive,
    isPaused,
    mode,
    currentMode,
    progress,
    completedSessions,
    workSessionsInCycle,
    sessionHistory,
    loadingHistory,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    switchMode,
    skipSession,
    loadSessionHistory,
    formatTime,
    TIMER_MODES,
  } = usePomodoro();

  const isRunning = isActive && !isPaused;

  // Load history when modal opens
  useEffect(() => {
    if (open && sessionHistory.length === 0) {
      loadSessionHistory();
    }
  }, [open, sessionHistory.length, loadSessionHistory]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleModeSwitch = (newMode) => {
    switchMode(newMode);
  };

  const handleSettingChange = (setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const getSessionIcon = (type) => {
    switch (type) {
      case "work":
        return <TimerIcon sx={{ color: "#4caf50" }} />;
      case "short_break":
        return <CoffeeIcon sx={{ color: "#2196f3" }} />;
      case "long_break":
        return <LongBreakIcon sx={{ color: "#ff9800" }} />;
      default:
        return <TimerIcon />;
    }
  };

  const getProgressColor = () => {
    switch (mode) {
      case "WORK":
        return "#4caf50";
      case "SHORT_BREAK":
        return "#2196f3";
      case "LONG_BREAK":
        return "#ff9800";
      default:
        return "#4caf50";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
          height: "auto",
          m: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {t("pomodoro.title", "Pomodoro Timer")}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0, overflow: "hidden" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            label={t("pomodoro.timer", "Timer")}
            icon={<TimerIcon />}
            iconPosition="start"
          />
          <Tab
            label={t("pomodoro.history", "History")}
            icon={<HistoryIcon />}
            iconPosition="start"
          />
          <Tab
            label={t("pomodoro.settings", "Settings")}
            icon={<SettingsIcon />}
            iconPosition="start"
          />
        </Tabs>

        {/* Timer Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ px: 2, pb: 2 }}>
            {/* Current Mode Indicator */}
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Chip
                label={t(`pomodoro.${mode.toLowerCase()}`, currentMode.label)}
                sx={{
                  backgroundColor: currentMode.color,
                  color: "white",
                  fontWeight: 600,
                  fontSize: "1rem",
                  px: 2,
                  py: 0.5,
                }}
              />
              {workSessionsInCycle > 0 && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: "text.secondary" }}
                >
                  {t("pomodoro.cycle", "Cycle")}: {workSessionsInCycle}/4
                </Typography>
              )}
            </Box>

            {/* Timer Display */}
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <motion.div
                animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    color: getProgressColor(),
                    textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                    mb: 1,
                  }}
                >
                  {formattedTime}
                </Typography>
              </motion.div>

              {/* Progress Bar */}
              <Box sx={{ width: "100%", mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "rgba(0,0,0,0.1)",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: getProgressColor(),
                      borderRadius: 4,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ display: "block", mt: 1, color: "text.secondary" }}
                >
                  {progress.toFixed(1)}% {t("pomodoro.complete", "complete")}
                </Typography>
              </Box>

              {/* Main Controls */}
              <Stack
                direction="row"
                spacing={1.5}
                justifyContent="center"
                sx={{ mb: 2 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={
                    isRunning ? pauseTimer : isPaused ? resumeTimer : startTimer
                  }
                  startIcon={isRunning ? <PauseIcon /> : <PlayIcon />}
                  sx={{
                    minWidth: 100,
                    py: 1,
                    backgroundColor: getProgressColor(),
                    "&:hover": {
                      backgroundColor: getProgressColor(),
                      opacity: 0.9,
                    },
                  }}
                >
                  {isRunning
                    ? t("pomodoro.pause", "Pause")
                    : isPaused
                    ? t("pomodoro.resume", "Resume")
                    : t("pomodoro.start", "Start")}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={resetTimer}
                  startIcon={<StopIcon />}
                  sx={{ minWidth: 100, py: 1 }}
                >
                  {t("pomodoro.reset", "Reset")}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={skipSession}
                  startIcon={<SkipIcon />}
                  sx={{ minWidth: 100, py: 1 }}
                >
                  {t("pomodoro.skip", "Skip")}
                </Button>
              </Stack>

              {/* Mode Switchers */}
              <Grid container spacing={1.5} sx={{ maxWidth: 500, mx: "auto" }}>
                {Object.entries(TIMER_MODES).map(([key, modeConfig]) => (
                  <Grid item xs={4} key={key}>
                    <Card
                      sx={{
                        cursor: "pointer",
                        border: mode === key ? 2 : 1,
                        borderColor:
                          mode === key ? modeConfig.color : "divider",
                        backgroundColor:
                          mode === key
                            ? `${modeConfig.color}10`
                            : "background.paper",
                        transition: "all 0.2s",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 2,
                        },
                      }}
                      onClick={() => handleModeSwitch(key)}
                    >
                      <CardContent sx={{ p: 1.5, textAlign: "center" }}>
                        {getSessionIcon(key.toLowerCase().replace("_", "_"))}
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, fontWeight: mode === key ? 600 : 400 }}
                        >
                          {t(`pomodoro.${key.toLowerCase()}`, modeConfig.label)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {Math.floor(modeConfig.duration / 60)}m
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </TabPanel>

        {/* History Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3, pb: 3, maxHeight: "400px", overflow: "auto" }}>
            <Typography variant="h6" gutterBottom>
              {t("pomodoro.recentSessions", "Recent Sessions")}
            </Typography>

            {loadingHistory ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <List>
                  {sessionHistory.map((session, index) => (
                    <ListItem key={session.id || index} divider>
                      <Box sx={{ mr: 2 }}>{getSessionIcon(session.type)}</Box>
                      <ListItemText
                        primary={t(
                          `pomodoro.${session.type}`,
                          session.type.replace("_", " ")
                        )}
                        secondary={
                          session.createdAt?.toLocaleTimeString() ||
                          "Unknown time"
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={formatTime(session.duration)}
                          size="small"
                          color={session.completed ? "success" : "default"}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                {sessionHistory.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">
                      {t(
                        "pomodoro.noSessions",
                        "No sessions completed yet. Start your first Pomodoro!"
                      )}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ px: 3, pb: 3, maxHeight: "400px", overflow: "auto" }}>
            <Typography variant="h6" gutterBottom>
              {t("pomodoro.timerSettings", "Timer Settings")}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  {t("pomodoro.workDuration", "Work Duration")}:{" "}
                  {settings.workDuration} min
                </Typography>
                <Slider
                  value={settings.workDuration}
                  onChange={(e, value) =>
                    handleSettingChange("workDuration", value)
                  }
                  min={10}
                  max={60}
                  marks={[
                    { value: 15, label: "15m" },
                    { value: 25, label: "25m" },
                    { value: 45, label: "45m" },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  {t("pomodoro.shortBreakDuration", "Short Break")}:{" "}
                  {settings.shortBreakDuration} min
                </Typography>
                <Slider
                  value={settings.shortBreakDuration}
                  onChange={(e, value) =>
                    handleSettingChange("shortBreakDuration", value)
                  }
                  min={3}
                  max={15}
                  marks={[
                    { value: 5, label: "5m" },
                    { value: 10, label: "10m" },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  {t("pomodoro.longBreakDuration", "Long Break")}:{" "}
                  {settings.longBreakDuration} min
                </Typography>
                <Slider
                  value={settings.longBreakDuration}
                  onChange={(e, value) =>
                    handleSettingChange("longBreakDuration", value)
                  }
                  min={10}
                  max={30}
                  marks={[
                    { value: 15, label: "15m" },
                    { value: 20, label: "20m" },
                    { value: 30, label: "30m" },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              {t("pomodoro.preferences", "Preferences")}
            </Typography>

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoStartBreaks}
                    onChange={(e) =>
                      handleSettingChange("autoStartBreaks", e.target.checked)
                    }
                  />
                }
                label={t("pomodoro.autoStartBreaks", "Auto-start breaks")}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoStartPomodoros}
                    onChange={(e) =>
                      handleSettingChange(
                        "autoStartPomodoros",
                        e.target.checked
                      )
                    }
                  />
                }
                label={t("pomodoro.autoStartPomodoros", "Auto-start pomodoros")}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications}
                    onChange={(e) =>
                      handleSettingChange("notifications", e.target.checked)
                    }
                  />
                }
                label={t(
                  "pomodoro.enableNotifications",
                  "Enable notifications"
                )}
              />
            </Stack>
          </Box>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}
