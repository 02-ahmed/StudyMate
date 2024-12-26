import { Suspense } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";

// Import HomeContent as a Client Component
const HomeContent = dynamic(() => import("./HomeContent"), {
  ssr: true,
});

export default function HomePage() {
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
      <HomeContent />
    </Suspense>
  );
}
