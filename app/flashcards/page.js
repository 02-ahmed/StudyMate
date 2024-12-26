import { Suspense } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";

// Import FlashcardsContent as a Client Component
const FlashcardsContent = dynamic(() => import("./FlashcardsContent"), {
  ssr: true,
});

export default function FlashcardsPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      }
    >
      <FlashcardsContent />
    </Suspense>
  );
}
