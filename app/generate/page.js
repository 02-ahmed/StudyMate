"use client";

import { useState } from "react";
import {
  Grid,
  Card,
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CardContent,
  AppBar,
  Toolbar,
  CircularProgress, // Import CircularProgress component
} from "@mui/material";
import { collection, doc, getDoc, writeBatch } from "firebase/firestore";
import db from "@/firebase";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flipped, setFlipped] = useState([]);
  const [text, setText] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [setName, setSetName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleOpenDialog = () => {
    if (!isSignedIn) {
      alert("Please sign in to save summary notes.");
      return;
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const saveFlashcards = async () => {
    if (!setName.trim()) {
      alert("Please enter a name for your summary notes set.");
      return;
    }

    try {
      const userDocRef = doc(collection(db, "users"), user.id);
      const userDocSnap = await getDoc(userDocRef);

      const batch = writeBatch(db);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const updatedSets = [
          ...(userData.flashcardSets || []),
          { name: setName },
        ];
        batch.update(userDocRef, { flashcardSets: updatedSets });
      } else {
        batch.set(userDocRef, { flashcardSets: [{ name: setName }] });
      }

      const setDocRef = doc(collection(userDocRef, "flashcardSets"), setName);
      batch.set(setDocRef, { flashcards });

      await batch.commit();

      alert("Summary notes saved successfully!");
      handleCloseDialog();
      setSetName("");
    } catch (error) {
      console.error("Error saving summary notes:", error);
      alert("An error occurred while saving summary notes. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert("Please enter some text to generate summary notes.");
      return;
    }

    setLoading(true); // Start loading

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: text,
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary notes");
      }

      const data = await response.json();
      setFlashcards(data);
    } catch (error) {
      console.error("Error generating summary notes:", error);
      alert(
        "An error occurred while generating summary notes. Please try again."
      );
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleViewSavedNotes = () => {
    if (!isSignedIn) {
      alert("Please sign in to view saved summary notes.");
      return;
    }
    router.push("/flashcards");
  };

  return (
    <>
      {/* AppBar with SignInButton and UserButton */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            StudyMate
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2, px: 1, py: 1, mr: 3, mb: 2 }}
            href="/flashcards"
          >
            View Notes
          </Button>
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
            Generate Summary Notes
          </Typography>
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            label="Enter text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
            sx={{ py: 1.5 }}
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" /> // Show loading indicator
            ) : (
              "Generate Summary Notes"
            )}
          </Button>
        </Box>
        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>Save Summary Notes Set</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter a name for your summary notes set.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Set Name"
              type="text"
              fullWidth
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={saveFlashcards} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      {flashcards.length > 0 && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#3f51b5" }}
          >
            Generated Summary Notes
          </Typography>
          <Typography>Tap on a note for more</Typography>
          <Grid container spacing={3}>
            {flashcards.map((summaryNote, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  onClick={() => {
                    const newFlipped = [...flipped];
                    newFlipped[index] = !newFlipped[index];
                    setFlipped(newFlipped);
                  }}
                >
                  <CardContent>
                    <Box sx={{ perspective: "1000px" }}>
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
                            {summaryNote.front}
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
                            {summaryNote.back}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {flashcards.length > 0 && (
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            sx={{ mr: 2 }}
            disabled={!isSignedIn} // Disable if user is not signed in
          >
            Save Summary Notes
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleViewSavedNotes}
            disabled={!isSignedIn} // Disable if user is not signed in
          >
            View Saved Summary Notes
          </Button>
        </Box>
      )}
    </>
  );
}
