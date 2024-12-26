"use client";

import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { db } from "../../utils/firebase";

export default function Flashcard() {
  const { user } = useUser();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadCollections() {
      if (!user) return;

      try {
        const collectionsData = [];

        // First, try to load from the old structure
        const userDocRef = doc(collection(db, "users"), user.id);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.flashcardSets) {
            // Handle old data structure
            for (const set of userData.flashcardSets) {
              const setDocRef = doc(
                collection(userDocRef, "flashcardSets"),
                set.name
              );
              const setDocSnap = await getDoc(setDocRef);
              if (setDocSnap.exists()) {
                const setData = setDocSnap.data();
                collectionsData.push({
                  id: set.name,
                  name: set.name,
                  createdAt: set.createdAt || new Date(),
                  cardCount: setData.flashcards
                    ? Object.keys(setData.flashcards).length
                    : 0,
                });
              }
            }
          }
        }

        // Now also load from the new structure
        const collectionsRef = collection(
          db,
          "users",
          user.id,
          "flashcardSets"
        );
        const querySnapshot = await getDocs(collectionsRef);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Only add if we don't already have this set
          if (!collectionsData.some((col) => col.id === doc.id)) {
            collectionsData.push({
              id: doc.id,
              name: data.name || doc.id,
              createdAt: data.createdAt,
              cardCount: data.flashcards
                ? Object.keys(data.flashcards).length
                : 0,
            });
          }
        });

        console.log("Loaded collections:", collectionsData);
        setCollections(collectionsData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading collections:", error);
        setLoading(false);
      }
    }

    loadCollections();
  }, [user]);

  const handleCardClick = (id) => {
    router.push(`/flashcards/${id}`);
  };

  const handleBackClick = () => {
    router.push("/notes");
  };

  const LoadingSkeleton = () => (
    <>
      <Box sx={{ my: 4, textAlign: "center" }}>
        <Button
          onClick={handleBackClick}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Notes
        </Button>

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#3f51b5" }}
        >
          My Note Collection
        </Typography>
        <Typography variant="body1" component="p" sx={{ mb: 4, color: "#666" }}>
          Click on a note set to view your summaries.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {[1, 2, 3].map((index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: "100%", bgcolor: "background.paper" }}>
              <CardContent>
                <Box
                  sx={{
                    height: 28,
                    width: "70%",
                    bgcolor: "grey.200",
                    borderRadius: 1,
                    mb: 2,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                <Box
                  sx={{
                    height: 20,
                    width: "40%",
                    bgcolor: "grey.200",
                    borderRadius: 1,
                    mb: 1,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                <Box
                  sx={{
                    height: 20,
                    width: "60%",
                    bgcolor: "grey.200",
                    borderRadius: 1,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );

  return (
    <Container maxWidth="md">
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <Box sx={{ my: 4, textAlign: "center" }}>
            <Button
              onClick={handleBackClick}
              startIcon={<ArrowBackIcon />}
              sx={{ mb: 2 }}
            >
              Back to Notes
            </Button>

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#3f51b5" }}
            >
              My Note Collection
            </Typography>
            <Typography
              variant="body1"
              component="p"
              sx={{ mb: 4, color: "#666" }}
            >
              Click on a note set to view your summaries.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {collections.map((collection) => (
              <Grid item xs={12} sm={6} md={4} key={collection.id}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleCardClick(collection.id)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {collection.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {collection.cardCount} cards
                      </Typography>
                      {collection.createdAt && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Created:{" "}
                          {new Date(
                            collection.createdAt.seconds * 1000
                          ).toLocaleDateString()}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
            {collections.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No note collections found
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Create your first note collection to get started
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Container>
  );
}
