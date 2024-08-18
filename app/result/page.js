"use client";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { green, red } from "@mui/material/colors";
const {
  Container,
  CircularProgress,
  Typography,
  Box,
  Button,
} = require("@mui/material");
const { useSearchParams } = require("next/navigation");
const { useRouter } = require("next/router");
const { useState, useEffect } = require("react");

const ResultPage = () => {
  // const router = useRouter()
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCheckoutSession = async () => {
      if (!session_id) return;
      try {
        const res = await fetch(
          `/api/checkout_sessions?session_id=${session_id}`
        );
        const sessionData = await res.json();
        if (res.ok) {
          setSession(sessionData);
        } else {
          setError(sessionData.error);
        }
      } catch (err) {
        setError("An error occurred while retrieving the session.");
      } finally {
        setLoading(false);
      }
    };
    fetchCheckoutSession();
  }, [session_id]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 40 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }
  if (error) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 40 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 40 }}>
      {session.payment_status === "paid" ? (
        // Payment Successful
        <>
          <CheckCircleOutlineIcon sx={{ fontSize: 50, color: green[500] }} />
          <Typography variant="h4">Thank you for your purchase!</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Session ID: {session_id}</Typography>
            <Typography variant="body1" gutterBottom>
              We have received your payment. You will receive an email with the
              order details shortly.
            </Typography>
            <Button variant="contained" href="/">
              Done
            </Button>
          </Box>
        </>
      ) : (
        // Payment Failed
        <>
          <ErrorOutlineIcon sx={{ fontSize: 50, color: red[500] }} />
          <Typography variant="h4">Payment failed</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Your payment was not successful. Please try again.
            </Typography>
            <Button variant="contained" href="/">
              Retry
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default ResultPage;
