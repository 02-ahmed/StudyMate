import { Suspense } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";

// Import NotesContent as a Client Component
const NotesContent = dynamic(() => import("./NotesContent"), {
  ssr: true,
});

export default function NotesPage() {
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
      <NotesContent />
    </Suspense>
  );
}
