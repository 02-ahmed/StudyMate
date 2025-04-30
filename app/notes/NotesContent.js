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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
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
  where,
} from "firebase/firestore";
import { createFlashcardSet, validateFlashcardSet } from "../../utils/schemas";

export default function NotesContent() {
  const { user } = useUser();
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTags, setEditTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

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
        // Only include non-deleted notes
        if (!data.isDeleted) {
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
        }
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
    if (
      !window.confirm(
        "Are you sure you want to hide this note set? You can restore it later."
      )
    )
      return;

    try {
      setDeletingNoteId(id);
      // Soft delete by updating isDeleted flag
      const docRef = doc(db, "users", user.id, "flashcardSets", id);
      await updateDoc(docRef, {
        isDeleted: true,
        deletedAt: new Date(),
      });

      // Update local state
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Error hiding note:", error);
      alert("Failed to hide note set");
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleEdit = (id) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      setEditingNote(note);
      setEditName(note.name);
      setEditTags(note.tags || []);
      setEditDialogOpen(true);
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingNote(null);
    setEditName("");
    setEditTags([]);
    setCurrentTag("");
  };

  const handleTagDelete = (tagToDelete) => {
    setEditTags(editTags.filter((tag) => tag !== tagToDelete));
  };

  const handleTagAdd = (event) => {
    if (event.key === "Enter" && currentTag.trim()) {
      if (!editTags.includes(currentTag.trim())) {
        setEditTags([...editTags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingNote || !editName.trim()) {
      alert("Please enter a name for your flashcard set.");
      return;
    }

    try {
      setSavingEdit(true);
      // Check for existing sets with same name (case insensitive)
      const flashcardsRef = collection(db, "users", user.id, "flashcardSets");
      const nameQuery = query(flashcardsRef);
      const nameQuerySnapshot = await getDocs(nameQuery);

      const nameExists = nameQuerySnapshot.docs.some((doc) => {
        // Skip checking the current note being edited
        if (doc.id === editingNote.id) return false;
        // Case insensitive comparison
        return doc.data().name?.toLowerCase() === editName.trim().toLowerCase();
      });

      if (nameExists) {
        alert(
          "A flashcard set with this name already exists. Please choose a different name."
        );
        return;
      }

      // Get the current document data
      const docRef = doc(db, "users", user.id, "flashcardSets", editingNote.id);
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.data();

      // Create an updated version of the flashcard set
      const updatedData = {
        ...currentData,
        name: editName.trim(),
        tags: editTags,
      };

      // Validate the data before updating
      if (!validateFlashcardSet(updatedData)) {
        console.error("Invalid flashcard set data:", updatedData);
        alert("Invalid data format. Please try again.");
        return;
      }

      await updateDoc(docRef, {
        name: editName.trim(),
        tags: editTags,
      });

      // Update local state
      setNotes(
        notes.map((note) =>
          note.id === editingNote.id
            ? { ...note, name: editName.trim(), tags: editTags }
            : note
        )
      );

      handleCloseEditDialog();
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note. Please try again.");
    } finally {
      setSavingEdit(false);
    }
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#3f51b5" }}>
          My Notes
        </Typography>
        <Button
          variant="text"
          color="primary"
          size="small"
          onClick={() => router.push("/notes/deleted")}
          startIcon={<DeleteIcon />}
        >
          View Deleted Notes
        </Button>
      </Box>

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
                        disabled={deletingNoteId === note.id}
                      >
                        {deletingNoteId === note.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <DeleteIcon />
                        )}
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

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Flashcard Set</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Update the name and tags for your flashcard set.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Set Name"
            type="text"
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            variant="outlined"
          />
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Add Tags"
              placeholder="Type and press Enter"
              fullWidth
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleTagAdd}
              variant="outlined"
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              {editTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleTagDelete(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            onClick={handleSaveEdit}
            color="primary"
            disabled={savingEdit}
            startIcon={savingEdit ? <CircularProgress size={20} /> : null}
          >
            {savingEdit ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
