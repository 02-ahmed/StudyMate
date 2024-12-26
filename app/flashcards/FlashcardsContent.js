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
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { db } from "../../utils/firebase";
import SearchIcon from "@mui/icons-material/Search";

function LoadingSkeleton() {
  return (
    <>
      <Box sx={{ my: 4, textAlign: "center" }}>
        <Button
          onClick={() => router.push("/notes")}
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
}

export default function FlashcardsContent() {
  const { user } = useUser();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allTags, setAllTags] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function loadCollections() {
      if (!user) return;

      try {
        const collectionsData = [];
        const tagsSet = new Set();

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
          // Add tags to the set
          if (data.tags) {
            data.tags.forEach((tag) => tagsSet.add(tag));
          }

          collectionsData.push({
            id: doc.id,
            name: data.name || doc.id,
            createdAt: data.createdAt,
            cardCount: data.flashcards ? data.flashcards.length : 0,
            tags: data.tags || [], // Include tags in collection data
          });
        });

        setAllTags(Array.from(tagsSet));
        setCollections(collectionsData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading collections:", error);
        setLoading(false);
      }
    }

    loadCollections();
  }, [user]);

  const handleTagClick = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredCollections = collections.filter((collection) => {
    const matchesSearch = collection.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => collection.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const handleCardClick = (id) => {
    router.push(`/flashcards/${id}`);
  };

  const handleBackClick = () => {
    router.push("/notes");
  };

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

            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {allTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleTagClick(tag)}
                    color={selectedTags.includes(tag) ? "primary" : "default"}
                    variant={selectedTags.includes(tag) ? "filled" : "outlined"}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {filteredCollections.map((collection) => (
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
                      {collection.tags && collection.tags.length > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            mt: 1,
                          }}
                        >
                          {collection.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ height: 24 }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
            {filteredCollections.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No matching note collections found
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Try adjusting your search or filters
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
