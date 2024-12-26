import { Suspense } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";

// Import FlashcardsIdContent as a Client Component
const FlashcardsIdContent = dynamic(() => import("./FlashcardsIdContent"), {
  ssr: true,
});

export default function FlashcardsIdPage({ params }) {
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
      <FlashcardsIdContent params={params} />
    </Suspense>
  );
}
