import { Suspense } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";

// Import PracticeTestContent as a Client Component
const PracticeTestContent = dynamic(() => import("./PracticeTestContent"), {
  ssr: true,
});

export default function PracticeTestPage({ params }) {
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
      <PracticeTestContent params={params} />
    </Suspense>
  );
}
