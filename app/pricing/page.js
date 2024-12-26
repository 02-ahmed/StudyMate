import { Suspense } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";

// Import PricingContent as a Client Component
const PricingContent = dynamic(() => import("./PricingContent"), {
  ssr: true,
});

export default function PricingPage() {
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
      <PricingContent />
    </Suspense>
  );
}
