"use client";

import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useUser } from "@clerk/nextjs";

export default function SummariseContent() {
  const { isSignedIn } = useUser();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/analysePdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      setUploadSuccess("File uploaded successfully!");
      setFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadSuccess("An error occurred while uploading the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#3f51b5" }}
      >
        Upload File for Summary
      </Typography>
      <TextField
        type="file"
        onChange={handleFileChange}
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        fullWidth
        sx={{ py: 1.5 }}
        disabled={loading /* || !isSignedIn */}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Upload File"
        )}
      </Button>
      {uploadSuccess && (
        <Typography variant="body1" color="primary" sx={{ mt: 2 }}>
          {uploadSuccess}
        </Typography>
      )}
    </Container>
  );
}
