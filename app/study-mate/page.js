import { Suspense } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";

const StudyMateContent = dynamic(() => import("./StudyMateContent"), {
  ssr: false,
});

export default function StudyMatePage() {
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
      <StudyMateContent />
    </Suspense>
  );
}
