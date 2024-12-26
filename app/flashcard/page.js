"use client";
import db from "@/firebase";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
  AppBar,
  Toolbar,
  CircularProgress,
} from "@mui/material";
import { collection, doc, getDocs } from "firebase/firestore";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";

function FlashcardContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const router = useRouter();

  const searchParams = useSearchParams();
  const search = searchParams.get("id");

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    async function getFlashcard() {
      if (!search || !user) return;
      const colRef = collection(db, "users", user.id, "flashcardSets");
      const docs = await getDocs(colRef);
      const flashcards = [];

      docs.forEach((doc) => {
        if (doc.id === search) {
          const flashcardsArray = Object.values(doc.data().flashcards || {});
          flashcards.push(...flashcardsArray);
        }
      });
      setFlashcards(flashcards);
    }
    getFlashcard();
  }, [search, user]);

  // Redirect to the quiz page
  const handleTakeQuiz = (id) => {
    router.push(`/quiz?id=${id}`);
  };

  // Navigate back to flashcards page
  const handleBackClick = () => {
    router.push("/flashcards");
  };

  return (
    <>
      {/* AppBar with SignInButton and UserButton */}
      <AppBar position="static">
        <Toolbar>
          <Link href="/" passHref legacyBehavior>
            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
              }}
              component="a"
            >
              StudyMate
            </Typography>
          </Link>
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <Button color="inherit">Sign In</Button>
            </SignInButton>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: "center" }}>
          {/* Back Button */}
          <Button
            onClick={handleBackClick}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Collection
          </Button>

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#3f51b5" }}
          >
            Summaries
          </Typography>
          <Typography
            variant="body1"
            component="p"
            sx={{ mb: 4, color: "#666" }}
          >
            Tap on a card to flip and view more.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {flashcards.length > 0 ? (
            flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={8} md={6} key={index}>
                <Card
                  sx={{
                    boxShadow: 3,
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <CardActionArea onClick={() => handleCardClick(index)}>
                    <CardContent>
                      <Box
                        sx={{
                          perspective: "1000px",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            height: "200px",
                            position: "relative",
                            transformStyle: "preserve-3d",
                            transition: "transform 0.6s",
                            transform: flipped[index]
                              ? "rotateY(180deg)"
                              : "rotateY(0deg)",
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              width: "100%",
                              height: "100%",
                              backfaceVisibility: "hidden",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: "#aaa",
                              border: "1px solid #ccc",
                              padding: 2,
                              boxSizing: "border-box",
                            }}
                          >
                            <Typography variant="h5" component="div">
                              {flashcard.front}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              position: "absolute",
                              width: "100%",
                              height: "100%",
                              backfaceVisibility: "hidden",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: "#fff",
                              border: "1px solid #ccc",
                              padding: 2,
                              boxSizing: "border-box",
                              transform: "rotateY(180deg)",
                            }}
                          >
                            <Typography variant="h5" component="div">
                              {flashcard.back}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography
              variant="body1"
              component="p"
              sx={{ mt: 4, color: "#666", textAlign: "center", width: "100%" }}
            >
              No flashcards found. Create your first flashcard set to get
              started!
            </Typography>
          )}
        </Grid>

        {flashcards.length > 0 && (
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}></Box>
        )}
      </Container>
    </>
  );
}

export default function Flashcard() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="md" sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading...
          </Typography>
        </Container>
      }
    >
      <FlashcardContent />
    </Suspense>
  );
}
