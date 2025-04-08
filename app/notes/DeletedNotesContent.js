"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { collection, getDocs, doc, updateDoc, query } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useRouter } from "next/navigation";
import RestoreIcon from "@mui/icons-material/Restore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function DeletedNotesContent() {
  const { user } = useUser();
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringNoteId, setRestoringNoteId] = useState(null);
  const router = useRouter();

  const loadDeletedNotes = useCallback(async () => {
    if (!user) return;

    try {
      const notesData = [];
      const q = query(collection(db, "users", user.id, "flashcardSets"));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Only include deleted notes
        if (data.isDeleted) {
          notesData.push({
            id: doc.id,
            name: data.name || doc.id,
            deletedAt: data.deletedAt?.toDate(),
            totalCards: data.flashcards ? data.flashcards.length : 0,
            tags: data.tags || [],
          });
        }
      });

      // Sort by deletion date, newest first
      notesData.sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
      setDeletedNotes(notesData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading deleted notes:", error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDeletedNotes();
  }, [loadDeletedNotes]);

  const handleRestore = async (id) => {
    if (!user) return;

    try {
      setRestoringNoteId(id);
      const docRef = doc(db, "users", user.id, "flashcardSets", id);
      await updateDoc(docRef, {
        isDeleted: false,
        deletedAt: null,
      });

      // Update local state
      setDeletedNotes(deletedNotes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Error restoring note:", error);
      alert("Failed to restore note set");
    } finally {
      setRestoringNoteId(null);
    }
  };

  const handleBack = () => {
    router.push("/notes");
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button onClick={handleBack} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Back to Notes
      </Button>

      <Typography variant="h4" sx={{ mb: 4 }}>
        Deleted Notes
      </Typography>

      {deletedNotes.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
          No deleted notes found.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {deletedNotes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {note.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {note.totalCards} cards
                      </Typography>
                      {note.deletedAt && (
                        <Typography variant="body2" color="text.secondary">
                          Deleted: {note.deletedAt.toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                    <Tooltip title="Restore">
                      <IconButton
                        onClick={() => handleRestore(note.id)}
                        disabled={restoringNoteId === note.id}
                      >
                        {restoringNoteId === note.id ? (
                          <CircularProgress size={24} />
                        ) : (
                          <RestoreIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
