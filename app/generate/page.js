"use client";

import { Suspense, useEffect } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// Import GenerateContent as a Client Component
const GenerateContent = dynamic(() => import("./GenerateContent"), {
  ssr: true,
});

export default function GeneratePage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user is not authenticated
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect=/generate");
    }
  }, [isLoaded, isSignedIn, router]);

  // If authentication is still loading, show loading spinner
  if (!isLoaded) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // If not signed in, don't render anything while redirect is happening
  if (!isSignedIn) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

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
