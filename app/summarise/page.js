import { Suspense } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";

// Import SummariseContent as a Client Component
const SummariseContent = dynamic(() => import("./SummariseContent"), {
  ssr: true,
});

export default function SummarisePage() {
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
      <SummariseContent />
    </Suspense>
  );
}
