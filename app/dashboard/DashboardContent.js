"use client";

import { useUser } from "@clerk/nextjs";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import NoteAddIcon from "@mui/icons-material/NoteAdd";

export default function DashboardContent() {
  const { user } = useUser();
  const [totalNotes, setTotalNotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadStats() {
      if (!user) return;

      try {
        const q = query(collection(db, "users", user.id, "flashcardSets"));
        const querySnapshot = await getDocs(q);
        setTotalNotes(querySnapshot.size);
        setLoading(false);
      } catch (error) {
        console.error("Error loading stats:", error);
        setLoading(false);
      }
    }

    loadStats();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, fontWeight: "bold", color: "#3f51b5" }}
      >
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", bgcolor: "background.paper" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <AutoStoriesIcon
                  sx={{ fontSize: 40, color: "#3f51b5", mr: 2 }}
                />
                <Typography variant="h5" component="div">
                  Your Study Stats
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 2 }}>
                {totalNotes}
              </Typography>
              <Typography color="text.secondary">Total Note Sets</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", bgcolor: "background.paper" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <NoteAddIcon sx={{ fontSize: 40, color: "#3f51b5", mr: 2 }} />
                <Typography variant="h5" component="div">
                  Quick Actions
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => router.push("/generate")}
                    sx={{ mb: 2 }}
                  >
                    Create New Notes
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={() => router.push("/notes")}
                  >
                    View My Notes
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
