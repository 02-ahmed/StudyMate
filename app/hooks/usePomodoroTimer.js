"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../utils/firebase";

const TIMER_MODES = {
  WORK: {
    duration: 25 * 60,
    label: "Work Session",
    nextMode: "SHORT_BREAK",
    color: "#4caf50",
  },
  SHORT_BREAK: {
    duration: 5 * 60,
    label: "Short Break",
    nextMode: "WORK",
    color: "#2196f3",
  },
  LONG_BREAK: {
    duration: 15 * 60,
    label: "Long Break",
    nextMode: "WORK",
    color: "#ff9800",
  },
};

export default function usePomodoroTimer() {
  const { user } = useUser();

  const [timeLeft, setTimeLeft] = useState(TIMER_MODES.WORK.duration);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState("WORK");
  const [completedSessions, setCompletedSessions] = useState(0);
  const [workSessionsInCycle, setWorkSessionsInCycle] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const intervalRef = useRef(null);
  const notificationPermissionRef = useRef(false);

  // Request notification permission on first load
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        notificationPermissionRef.current = permission === "granted";
      });
    } else if (
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      notificationPermissionRef.current = true;
    }
  }, []);

  // Load session history from Firebase
  const loadSessionHistory = useCallback(async () => {
    if (!user) return;

    setLoadingHistory(true);
    try {
      const pomodoroSessionsRef = collection(
        db,
        "users",
        user.id,
        "pomodoroSessions"
      );

      const q = query(
        pomodoroSessionsRef,
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const sessions = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          type: data.type,
          duration: data.duration,
          completed: data.completed,
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate(),
        });
      });

      setSessionHistory(sessions);
    } catch (error) {
      console.error("Error loading session history:", error);
    } finally {
      setLoadingHistory(false);
    }
  }, [user]);

  // Load history when user changes
  useEffect(() => {
    if (user) {
      loadSessionHistory();
    }
  }, [user, loadSessionHistory]);

  // Timer countdown logic
  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isPaused, timeLeft]);

  const showNotification = useCallback((title, body) => {
    if (notificationPermissionRef.current && "Notification" in window) {
      new Notification(title, {
        body,
        icon: "/images/favicon.png",
        badge: "/images/favicon.png",
      });
    }
  }, []);

  const saveSessionToFirebase = useCallback(
    async (sessionData) => {
      if (!user) return;

      try {
        const pomodoroSessionsRef = collection(
          db,
          "users",
          user.id,
          "pomodoroSessions"
        );

        await addDoc(pomodoroSessionsRef, {
          ...sessionData,
          userId: user.id,
          createdAt: serverTimestamp(),
        });

        // Reload history after saving
        loadSessionHistory();
      } catch (error) {
        console.error("Error saving Pomodoro session:", error);
      }
    },
    [user, loadSessionHistory]
  );

  const handleSessionComplete = useCallback(() => {
    const currentMode = TIMER_MODES[mode];
    const sessionEndTime = new Date();
    const sessionDuration = sessionStartTime
      ? Math.round((sessionEndTime - sessionStartTime) / 1000)
      : currentMode.duration;

    // Save completed session to Firebase
    saveSessionToFirebase({
      type: mode.toLowerCase(),
      duration: sessionDuration,
      completed: true,
      startTime:
        sessionStartTime || new Date(Date.now() - currentMode.duration * 1000),
      endTime: sessionEndTime,
    });

    // Update session counters
    setCompletedSessions((prev) => prev + 1);

    if (mode === "WORK") {
      const newWorkSessions = workSessionsInCycle + 1;
      setWorkSessionsInCycle(newWorkSessions);

      // After 4 work sessions, trigger long break
      if (newWorkSessions >= 4) {
        setMode("LONG_BREAK");
        setWorkSessionsInCycle(0);
        showNotification(
          "Great work! 🎉",
          "You've completed 4 work sessions. Time for a long break!"
        );
      } else {
        setMode("SHORT_BREAK");
        showNotification(
          "Work session complete! ✅",
          "Time for a short break to recharge."
        );
      }
    } else {
      setMode("WORK");
      showNotification(
        "Break's over! 💪",
        "Ready to start your next work session?"
      );
    }

    // Reset timer for next session
    const nextMode =
      mode === "WORK"
        ? workSessionsInCycle + 1 >= 4
          ? "LONG_BREAK"
          : "SHORT_BREAK"
        : "WORK";

    setTimeLeft(TIMER_MODES[nextMode].duration);
    setIsActive(false);
    setIsPaused(false);
    setSessionStartTime(null);
  }, [
    mode,
    workSessionsInCycle,
    sessionStartTime,
    saveSessionToFirebase,
    showNotification,
  ]);

  const startTimer = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    if (!sessionStartTime) {
      setSessionStartTime(new Date());
    }
  }, [sessionStartTime]);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(TIMER_MODES[mode].duration);
    setSessionStartTime(null);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [mode]);

  const switchMode = useCallback((newMode) => {
    setIsActive(false);
    setIsPaused(false);
    setMode(newMode);
    setTimeLeft(TIMER_MODES[newMode].duration);
    setSessionStartTime(null);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const skipSession = useCallback(() => {
    const nextMode =
      mode === "WORK"
        ? workSessionsInCycle >= 3
          ? "LONG_BREAK"
          : "SHORT_BREAK"
        : "WORK";

    if (mode === "WORK") {
      setWorkSessionsInCycle((prev) => {
        const newCount = prev + 1;
        return newCount >= 4 ? 0 : newCount;
      });
    }

    switchMode(nextMode);
  }, [mode, workSessionsInCycle, switchMode]);

  // Format time for display
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Get progress percentage
  const getProgress = useCallback(() => {
    const totalDuration = TIMER_MODES[mode].duration;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  }, [mode, timeLeft]);

  return {
    // Timer state
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isActive,
    isPaused,
    mode,
    currentMode: TIMER_MODES[mode],
    progress: getProgress(),

    // Session tracking
    completedSessions,
    workSessionsInCycle,
    sessionHistory,
    loadingHistory,

    // Timer controls
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    switchMode,
    skipSession,
    loadSessionHistory,

    // Utility
    formatTime,
    TIMER_MODES,
  };
}
