"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  CardActionArea,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { db } from "../../utils/firebase";
import {
  collection,
  query,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function Notes() {
  const { user } = useUser();
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;

    try {
      // First, try to load from the old structure
      const userDocRef = doc(collection(db, "users"), user.id);
      const userDocSnap = await getDoc(userDocRef);
      const notesData = [];

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.flashcardSets) {
          // Handle old data structure
          userData.flashcardSets.forEach((set) => {
            notesData.push({
              id: set.name, // In old structure, name was used as ID
              name: set.name,
              createdAt: set.createdAt || new Date(),
              totalCards: 0, // We'll update this when we fetch the actual flashcards
            });
          });

          // Fetch flashcards for each set
          for (const set of notesData) {
            const setDocRef = doc(
              collection(userDocRef, "flashcardSets"),
              set.id
            );
            const setDocSnap = await getDoc(setDocRef);
            if (setDocSnap.exists()) {
              const setData = setDocSnap.data();
              set.totalCards = setData.flashcards
                ? Object.keys(setData.flashcards).length
                : 0;
            }
          }
        }
      }

      // Now also try to load from the new structure
      const q = query(collection(db, "users", user.id, "flashcardSets"));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const flashcards = data.flashcards
          ? Object.keys(data.flashcards).length
          : 0;
        // Only add if we don't already have this set (avoid duplicates)
        if (!notesData.some((note) => note.id === doc.id)) {
          notesData.push({
            id: doc.id,
            name: data.name || doc.id,
            createdAt: data.createdAt?.toDate(),
            totalCards: flashcards,
          });
        }
      });

      // Sort by creation date, newest first
      notesData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      console.log("Loaded notes:", notesData);
      setNotes(notesData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading notes:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this note set?"))
      return;

    try {
      // Delete from the new structure
      await deleteDoc(doc(db, "users", user.id, "flashcardSets", id));

      // Also try to delete from the old structure if it exists
      const userDocRef = doc(collection(db, "users"), user.id);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.flashcardSets) {
          // Remove the set from the array
          const updatedSets = userData.flashcardSets.filter(
            (set) => set.name !== id
          );
          // Update the user document
          await updateDoc(userDocRef, {
            flashcardSets: updatedSets,
          });

          // Also delete the flashcard set document from the old structure
          await deleteDoc(doc(collection(userDocRef, "flashcardSets"), id));
        }
      }

      // Update local state
      setNotes(notes.filter((note) => note.id !== id));

      // Force reload the notes to ensure everything is in sync
      loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note set");
    }
  };

  const handleEdit = (id) => {
    router.push(`/edit/${id}`);
  };

  const handleNoteClick = (note) => {
    router.push(`/flashcards/${encodeURIComponent(note.id)}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          sx={{ mb: 4, fontWeight: "bold", color: "#3f51b5" }}
        >
          My Notes
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map((index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  bgcolor: "background.paper",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        height: 24,
                        width: "60%",
                        bgcolor: "grey.200",
                        borderRadius: 1,
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                    <Stack direction="row" spacing={1}>
                      <Box
                        sx={{
                          height: 24,
                          width: 24,
                          bgcolor: "grey.200",
                          borderRadius: 1,
                          animation: "pulse 1.5s ease-in-out infinite",
                        }}
                      />
                      <Box
                        sx={{
                          height: 24,
                          width: 24,
                          bgcolor: "grey.200",
                          borderRadius: 1,
                          animation: "pulse 1.5s ease-in-out infinite",
                        }}
                      />
                    </Stack>
                  </Box>
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
                      width: "70%",
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
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, fontWeight: "bold", color: "#3f51b5" }}
      >
        My Notes
      </Typography>

      <Grid container spacing={3}>
        {notes.map((note) => (
          <Grid item xs={12} sm={6} md={4} key={note.id}>
            <Card
              sx={{
                height: "100%",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardActionArea onClick={() => handleNoteClick(note)}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">{note.name}</Typography>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(note.id);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {note.totalCards} cards
                  </Typography>
                  {note.createdAt && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Created: {note.createdAt.toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
        {notes.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No notes yet
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your first note set to get started
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
