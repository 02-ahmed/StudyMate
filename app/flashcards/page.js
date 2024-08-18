"use client";
import { db } from "@/firebase";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import {
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
  AppBar,
  Toolbar,
  Box,
  Button,
} from "@mui/material";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const router = useRouter();

  const handleCardClick = (id) => {
    router.push(`/flashcard?id=${id}`);
  };

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return;
      const docRef = doc(collection(db, "users"), user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const collections = docSnap.data().flashcardSets || [];
        setFlashcards(collections);
      } else {
        await setDoc(docRef, { flashcards: [] });
      }
    }
    getFlashcards();
  }, [user]);

  return (
    <>
      {/* AppBar with SignInButton and UserButton */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            StudyMate
          </Typography>
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
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#3f51b5" }}
          >
            My Note collection
          </Typography>
          <Typography
            variant="body1"
            component="p"
            sx={{ mb: 4, color: "#666" }}
          >
            Click on a note set to view your summaries.
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mt: 4 }}>
          {flashcards.length > 0 ? (
            flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    boxShadow: 3,
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleCardClick(flashcard.name)}
                  >
                    <CardContent>
                      <Typography
                        variant="h5"
                        component="div"
                        sx={{ fontWeight: "bold", color: "#3f51b5" }}
                      >
                        {flashcard.name}
                      </Typography>
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
              No flashcard sets found. Create your first flashcard set to get
              started!
            </Typography>
          )}
        </Grid>
      </Container>
    </>
  );
}
