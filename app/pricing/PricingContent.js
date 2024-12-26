"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";

export default function PricingContent() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#3f51b5" }}
        >
          Choose Your Plan
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          sx={{ color: "text.secondary", mb: 4 }}
        >
          Select the perfect plan for your study needs
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {/* Free Plan */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 4 }}>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#3f51b5" }}
              >
                Free
              </Typography>
              <Typography
                variant="h3"
                component="p"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                $0
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: "text.secondary", mb: 4 }}
              >
                per month
              </Typography>
              <Box sx={{ mb: 4 }}>
                <Typography paragraph>✓ Basic note creation</Typography>
                <Typography paragraph>✓ Up to 50 flashcards</Typography>
                <Typography paragraph>✓ Basic study analytics</Typography>
                <Typography paragraph>✓ Community support</Typography>
              </Box>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                href="/sign-up"
                sx={{ width: "100%" }}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Pro Plan */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              border: "2px solid #3f51b5",
              transform: "scale(1.05)",
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 4 }}>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#3f51b5" }}
              >
                Pro
              </Typography>
              <Typography
                variant="h3"
                component="p"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                $9.99
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: "text.secondary", mb: 4 }}
              >
                per month
              </Typography>
              <Box sx={{ mb: 4 }}>
                <Typography paragraph>✓ Everything in Free</Typography>
                <Typography paragraph>✓ Unlimited flashcards</Typography>
                <Typography paragraph>✓ Advanced study analytics</Typography>
                <Typography paragraph>✓ Priority support</Typography>
                <Typography paragraph>
                  ✓ AI-powered study suggestions
                </Typography>
                <Typography paragraph>✓ Custom study schedules</Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                size="large"
                href="/sign-up"
                sx={{ width: "100%" }}
              >
                Get Pro
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom sx={{ color: "text.secondary" }}>
          Need a custom plan for your organization?
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          href="mailto:contact@studymate.com"
        >
          Contact Us
        </Button>
      </Box>
    </Container>
  );
}
