"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "quill/dist/quill.snow.css";
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
  Chip,
  Tabs,
  Tab,
  Paper,
  Divider,
  IconButton,
} from "@mui/material";
import {
  collection,
  doc,
  getDoc,
  writeBatch,
  addDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import DeleteIcon from "@mui/icons-material/Delete";

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

export default function GenerateContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flipped, setFlipped] = useState([]);
  const [text, setText] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [setName, setSetName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [inputMethod, setInputMethod] = useState(0); // 0 for text, 1 for file
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);

  // Define allowed file types
  const allowedTypes = [
    "application/pdf", // PDF
    "text/plain", // Text
    "application/vnd.ms-powerpoint", // PPT
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
    "application/msword", // DOC
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  ];

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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
        tags: tags,
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

  const handleTagDelete = (tagToDelete) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const handleTagAdd = (event) => {
    if (event.key === "Enter" && currentTag.trim()) {
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      // Check if file type is supported
      if (!allowedTypes.includes(selectedFile.type)) {
        setFileError(
          "Unsupported file type. Please upload a PDF, Word document, or PowerPoint presentation."
        );
        event.target.value = null; // Reset file input
        return;
      }

      setFile(selectedFile);
      setFileError(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async () => {
    // Check if we're in text mode or file mode
    if (inputMethod === 0) {
      // Text mode
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
    } else {
      // File mode
      if (!file) {
        alert("Please select a file to upload.");
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("File processing failed");
        }

        const data = await response.json();
        setFlashcards(data);
      } catch (error) {
        console.error("Error processing file:", error);
        alert("An error occurred while processing the file. Please try again.");
      } finally {
        setLoading(false);
      }
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

        {/* Input Method Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={inputMethod}
            onChange={(e, newValue) => {
              if (!isSignedIn && newValue === 1) {
                alert("Please sign in to use file upload feature");
                return;
              }
              setInputMethod(newValue);
            }}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab icon={<TextFieldsIcon />} label="Type or Paste" />
            <Tab
              icon={<AttachFileIcon />}
              label="Upload File"
              disabled={!isSignedIn}
            />
          </Tabs>

          {/* Text Input */}
          {inputMethod === 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ backgroundColor: "white", borderRadius: 1 }}>
                <ReactQuill
                  value={text}
                  onChange={setText}
                  modules={modules}
                  formats={formats}
                  placeholder="Enter text..."
                  style={{ height: "200px" }}
                />
              </Box>
              {!isSignedIn && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2, textAlign: "center" }}
                >
                  Sign in to unlock all features: file upload, saving cards, and
                  more!
                </Typography>
              )}
            </Box>
          )}

          {/* File Upload */}
          {inputMethod === 1 && (
            <Box sx={{ p: 3, backgroundColor: "white", borderRadius: 1 }}>
              {!isSignedIn ? (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Sign in Required
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Please sign in to upload files and access all features.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, textAlign: "center" }}
                  >
                    Supported file types: PDF, text files, and images (PNG,
                    JPEG, GIF, WebP)
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      p: 3,
                      border: "2px dashed #ccc",
                      borderRadius: 2,
                      mb: 3,
                    }}
                  >
                    <CloudUploadIcon
                      sx={{ fontSize: 60, color: "#3f51b5", mb: 2 }}
                    />

                    <input
                      accept=".pdf,.txt,.png,.jpg,.jpeg,.gif,.webp"
                      style={{ display: "none" }}
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="contained"
                        component="span"
                        startIcon={<AttachFileIcon />}
                      >
                        Select File
                      </Button>
                    </label>

                    {file && (
                      <Box sx={{ mt: 2, width: "100%" }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                flexGrow: 1,
                              }}
                            >
                              <InsertDriveFileIcon
                                sx={{ mr: 1, color: "#3f51b5" }}
                              />
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: "medium" }}
                              >
                                {file.name}
                              </Typography>
                            </Box>
                            <IconButton onClick={handleRemoveFile} size="small">
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mt: 1,
                            }}
                          >
                            <Chip
                              label={file.type || "Unknown type"}
                              size="small"
                            />
                            <Typography variant="body2" color="textSecondary">
                              {formatFileSize(file.size)}
                            </Typography>
                          </Box>
                        </Paper>
                      </Box>
                    )}

                    {fileError && (
                      <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                        {fileError}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Box>
          )}
        </Paper>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
          sx={{ py: 1.5, mt: 2 }}
          disabled={
            loading ||
            (inputMethod === 0 && !text.trim()) ||
            (inputMethod === 1 && !file)
          }
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
              {tags.map((tag) => (
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
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
                    boxShadow: "0 4px 20px rgba(63, 81, 181, 0.15)",
                    transition:
                      "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 30px rgba(63, 81, 181, 0.2)",
                    },
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
                            borderRadius: 2,
                            border: "1px solid rgba(63, 81, 181, 0.1)",
                            padding: 2,
                            boxSizing: "border-box",
                            background:
                              "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
                            boxShadow: "inset 0 0 10px rgba(63, 81, 181, 0.05)",
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {
                              width: "6px",
                            },
                            "&::-webkit-scrollbar-track": {
                              background: "#f1f1f1",
                              borderRadius: "3px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: "#3f51b5",
                              borderRadius: "3px",
                              "&:hover": {
                                background: "#303f9f",
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
                              color: "#3f51b5",
                              fontWeight: 500,
                              textAlign: "center",
                              lineHeight: 1.6,
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
                            borderRadius: 2,
                            border: "1px solid rgba(63, 81, 181, 0.1)",
                            padding: 2,
                            boxSizing: "border-box",
                            transform: "rotateY(180deg)",
                            background:
                              "linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)",
                            boxShadow: "inset 0 0 10px rgba(63, 81, 181, 0.05)",
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {
                              width: "6px",
                            },
                            "&::-webkit-scrollbar-track": {
                              background: "#f1f1f1",
                              borderRadius: "3px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: "#3f51b5",
                              borderRadius: "3px",
                              "&:hover": {
                                background: "#303f9f",
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
                              color: "#3f51b5",
                              fontWeight: 500,
                              textAlign: "center",
                              lineHeight: 1.6,
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
