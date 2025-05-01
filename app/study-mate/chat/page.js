"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Box } from "@mui/material";
import ChatAssistant from "./ChatAssistant";

export default function ChatPage() {
  const { user } = useUser();

  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)",
        overflow: "hidden",
      }}
    >
      <ChatAssistant userId={user?.id} />
    </Box>
  );
}
