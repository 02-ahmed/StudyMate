"use client";

import { useEffect } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";

export default function StudyMatePage() {
  const router = useRouter();

  // Redirect to chat page since this is the main feature from study-mate now
  useEffect(() => {
    // Redirect to chat with a short delay to avoid immediate redirect
    const redirectTimer = setTimeout(() => {
      router.push("/study-mate/chat");
    }, 100);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  // Show loading indicator briefly before redirect
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    </Container>
  );
}
