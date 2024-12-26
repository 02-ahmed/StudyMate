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
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import NoteAddIcon from "@mui/icons-material/NoteAdd";

export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const flashcardsRef = collection(db, "users", user.id, "flashcardSets");
      const querySnapshot = await getDocs(flashcardsRef);

      let totalSets = 0;
      let totalCards = 0;

      querySnapshot.forEach((doc) => {
        totalSets++;
        const data = doc.data();
        if (Array.isArray(data.flashcards)) {
          totalCards += data.flashcards.length;
        } else if (typeof data.flashcards === "object") {
          totalCards += Object.keys(data.flashcards).length;
        }
      });

      setStats({
        totalSets,
        totalCards,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error loading stats:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
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
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AutoStoriesIcon
                  sx={{ fontSize: 40, color: "#3f51b5", mr: 2 }}
                />
                <Typography variant="h5" component="div">
                  Your Study Stats
                </Typography>
              </Box>
              <Typography variant="h3" color="primary" sx={{ mb: 2 }}>
                {stats?.totalSets || 0}
              </Typography>
              <Typography color="text.secondary">Total Note Sets</Typography>
              <Typography variant="h3" color="primary" sx={{ mb: 2, mt: 4 }}>
                {stats?.totalCards || 0}
              </Typography>
              <Typography color="text.secondary">Total Flashcards</Typography>
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
