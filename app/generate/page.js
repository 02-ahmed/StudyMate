"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import {
  Grid,
  Card,
  Container,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CardContent,
  CircularProgress,
  TextField,
} from "@mui/material";
import {
  collection,
  doc,
  getDoc,
  writeBatch,
  addDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <CircularProgress />,
});

// Quill modules configuration
const modules = {
  toolbar: [
    ["bold", "italic"], // Only bold and italic for now
  ],
};

const formats = ["bold", "italic"];

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flipped, setFlipped] = useState([]);
  const [text, setText] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [setName, setSetName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
      const flashcardsRef = collection(db, "users", user.id, "flashcardSets");
      const docRef = await addDoc(flashcardsRef, {
        name: setName.trim(),
        createdAt: new Date(),
        flashcards: flashcards.map((card, index) => ({
          front: card.front,
          back: card.back,
          id: index,
        })),
      });

      alert("Summary notes saved successfully!");
      handleCloseDialog();
      router.push(`/flashcards/${docRef.id}`);
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

    setLoading(true);
    try {
      // Strip HTML tags for the API call
      const plainText = text.replace(/<[^>]+>/g, "");

      const response = await fetch("/api/generate", {
        method: "POST",
        body: plainText,
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
      setLoading(false);
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
        <Box sx={{ mb: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            sx={{ px: 3, py: 1 }}
            href="/flashcards"
            disabled={!isSignedIn}
          >
            View Notes
          </Button>
        </Box>
        <Box sx={{ mb: 2, backgroundColor: "white", borderRadius: 1 }}>
          <ReactQuill
            value={text}
            onChange={setText}
            modules={modules}
            formats={formats}
            placeholder="Enter text..."
            style={{ height: "200px" }}
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
          sx={{ py: 1.5, mt: 2 }}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
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
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                            padding: 2,
                            boxSizing: "border-box",
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {
                              width: "8px",
                            },
                            "&::-webkit-scrollbar-track": {
                              background: "#f1f1f1",
                              borderRadius: "4px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: "#888",
                              borderRadius: "4px",
                              "&:hover": {
                                background: "#666",
                              },
                            },
                          }}
                        >
                          <Typography
                            variant="h6"
                            component="div"
                            sx={{
                              wordBreak: "break-word",
                              whiteSpace: "pre-wrap",
                              maxWidth: "100%",
                              fontSize: "1rem",
                            }}
                          >
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
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {
                              width: "8px",
                            },
                            "&::-webkit-scrollbar-track": {
                              background: "#f1f1f1",
                              borderRadius: "4px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: "#888",
                              borderRadius: "4px",
                              "&:hover": {
                                background: "#666",
                              },
                            },
                          }}
                        >
                          <Typography
                            variant="h6"
                            component="div"
                            sx={{
                              wordBreak: "break-word",
                              whiteSpace: "pre-wrap",
                              maxWidth: "100%",
                              fontSize: "1rem",
                            }}
                          >
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
    </Container>
  );
}
