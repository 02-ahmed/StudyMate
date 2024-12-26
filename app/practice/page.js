import { Suspense } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";

// Import PracticeContent as a Client Component
const PracticeContent = dynamic(() => import("./PracticeContent"), {
  ssr: true,
});

export default function PracticePage() {
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
      <PracticeContent />
    </Suspense>
  );
}
