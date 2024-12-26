"use client";

import { useState, useEffect, useCallback } from "react";
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
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
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

export default function NotesContent() {
  const { user } = useUser();
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allTags, setAllTags] = useState([]);

  const loadNotes = useCallback(async () => {
    if (!user) return;

    try {
      const notesData = [];
      const tagsSet = new Set();

      // Load from the new structure
      const q = query(collection(db, "users", user.id, "flashcardSets"));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Add tags to the set
        if (data.tags) {
          data.tags.forEach((tag) => tagsSet.add(tag));
        }

        notesData.push({
          id: doc.id,
          name: data.name || doc.id,
          createdAt: data.createdAt?.toDate(),
          totalCards: data.flashcards ? data.flashcards.length : 0,
          tags: data.tags || [], // Include tags in note data
        });
      });

      // Sort by creation date, newest first
      notesData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setAllTags(Array.from(tagsSet));
      setNotes(notesData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading notes:", error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user, loadNotes]);

  const handleTagClick = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => note.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

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

      <Grid container spacing={3}>
        {filteredNotes.map((note) => (
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
                  {note.tags && note.tags.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mt: 1,
                      }}
                    >
                      {note.tags.map((tag) => (
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
        {filteredNotes.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No matching notes found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search or filters
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
