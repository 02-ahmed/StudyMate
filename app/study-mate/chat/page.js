"use client";

import { Suspense } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";

// Import ChatAssistant dynamically with SSR disabled
const ChatAssistant = dynamic(() => import("./ChatAssistant"), {
  ssr: false,
});

export default function ChatPage() {
  // Try to get user ID from local storage on the client side
  let userId = null;
  if (typeof window !== "undefined") {
    try {
      userId = window.clerkUserInfo?.id || localStorage.getItem("userId");
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Suspense fallback={<CircularProgress />}>
        <ChatAssistant userId={userId} />
      </Suspense>
    </Container>
  );
}
