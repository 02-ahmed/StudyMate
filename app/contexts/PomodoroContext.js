"use client";

import { createContext, useContext } from "react";
import usePomodoroTimer from "../hooks/usePomodoroTimer";

const PomodoroContext = createContext(null);

export function PomodoroProvider({ children }) {
  const pomodoroState = usePomodoroTimer();

  return (
    <PomodoroContext.Provider value={pomodoroState}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }
  return context;
}
