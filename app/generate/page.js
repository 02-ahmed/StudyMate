import { Suspense } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";

// Import GenerateContent as a Client Component
const GenerateContent = dynamic(() => import("./GenerateContent"), {
  ssr: true,
});

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <Container className="bg-blue-200" maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      }
    >
      <GenerateContent />
    </Suspense>
  );
}
