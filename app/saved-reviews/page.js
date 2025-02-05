import { Suspense } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";

const SavedReviewsContent = dynamic(() => import("./SavedReviewsContent"), {
  ssr: false,
});

export default function SavedReviewsPage() {
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
      <SavedReviewsContent />
    </Suspense>
  );
}
