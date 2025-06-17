"use client";

import { useState, useEffect, useMemo } from "react";
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
  IconButton,
  Tooltip,
  Fade,
} from "@mui/material";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ViewListIcon from "@mui/icons-material/ViewList";
import FlipIcon from "@mui/icons-material/Flip";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { createFlashcardSet, cleanFlashcardContent } from "../../utils/schemas";
import { useLanguage } from "../contexts/LanguageContext";
import useTranslation from "../hooks/useTranslation";
import TextToSpeech from "../components/TextToSpeech";

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress />
    </Box>
  ),
});

const modules = {
  toolbar: [
    ["bold", "italic", "underline"],
    ["blockquote", "code-block"],
  ],
};

const formats = ["bold", "italic", "underline", "blockquote", "code-block"];

export default function GenerateContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flipped, setFlipped] = useState([]);
  const [text, setText] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [setName, setSetName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const router = useRouter();
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [inputMethod, setInputMethod] = useState(0); // 0 for text, 1 for file
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [savingFlashcards, setSavingFlashcards] = useState(false);
  const { language } = useLanguage();
  const { t } = useTranslation(); // Add translation hook

  // Define allowed file types
  const allowedTypes = [
    "application/pdf", // PDF
    "text/plain", // Text
    "image/png", // PNG
    "image/jpeg", // JPG/JPEG
    "image/gif", // GIF
    "image/webp", // WebP
  ];

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Constants for file upload
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  // Loading messages
  const loadingMessages = useMemo(
    () => [
      t(
        "generatePage.loadingMessages.generating",
        "Generating your flashcards..."
      ),
      t(
        "generatePage.loadingMessages.breaking",
        "Breaking down the content into bite-sized pieces..."
      ),
      t(
        "generatePage.loadingMessages.creating",
        "Creating comprehensive study materials..."
      ),
      t(
        "generatePage.loadingMessages.didYouKnow",
        "Did you know? Active recall through flashcards is one of the most effective study methods!"
      ),
      t(
        "generatePage.loadingMessages.organizing",
        "Almost there! Organizing your flashcards..."
      ),
      t(
        "generatePage.loadingMessages.proTip",
        "Pro tip: Regular review of flashcards helps move information to long-term memory"
      ),
      t(
        "generatePage.loadingMessages.capturing",
        "Making sure we capture all the important concepts..."
      ),
      t(
        "generatePage.loadingMessages.funFact",
        "Fun fact: Spaced repetition can improve retention by up to 200%!"
      ),
      t(
        "generatePage.loadingMessages.stillWorking",
        "Still working... Complex topics take time to process properly"
      ),
      t(
        "generatePage.loadingMessages.connections",
        "Creating connections between concepts..."
      ),
    ],
    [t]
  );

  // Add useEffect for rotating messages
  useEffect(() => {
    // Don't do anything if not loading
    if (!loading) return;

    // Use a stable reference to the messages
    const messages = loadingMessages;

    // Set the first message
    setLoadingMessage(messages[0]);
    setMessageIndex(0);

    // Keep a reference to the index outside of the interval
    let currentIndex = 0;

    // Set up the rotation interval
    const timer = setInterval(() => {
      // Update the index and wrap around when we reach the end
      currentIndex = (currentIndex + 1) % messages.length;
      // Set the new message
      setLoadingMessage(messages[currentIndex]);
      setMessageIndex(currentIndex);
    }, 5000);

    // Clean up the interval when the component unmounts or loading changes
    return () => clearInterval(timer);
  }, [loading]); // Only depend on loading state

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
      setSavingFlashcards(true);
      const flashcardsRef = collection(db, "users", user.id, "flashcardSets");

      // Check for existing set with same name (case insensitive)
      const nameQuery = query(flashcardsRef);
      const nameQuerySnapshot = await getDocs(nameQuery);

      const nameExists = nameQuerySnapshot.docs.some(
        (doc) => doc.data().name?.toLowerCase() === setName.trim().toLowerCase()
      );

      if (nameExists) {
        alert(
          "A flashcard set with this name already exists. Please choose a different name."
        );
        return;
      }

      // Create a validated flashcard set using our schema helper
      const validatedFlashcardSet = createFlashcardSet({
        name: setName.trim(),
        createdAt: new Date(),
        tags: tags,
        flashcards: flashcards.map((card, index) => ({
          front: card.front,
          back: card.back,
          id: index,
        })),
        language: language,
      });

      const docRef = await addDoc(flashcardsRef, validatedFlashcardSet);

      alert("Summary notes saved successfully!");
      handleCloseDialog();
      router.push(`/flashcards/${docRef.id}`);
    } catch (error) {
      console.error("Error saving summary notes:", error);
      alert("An error occurred while saving summary notes. Please try again.");
    } finally {
      setSavingFlashcards(false);
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
          "Unsupported file type. Please upload a PDF, text file, or image (PNG, JPEG, GIF, WebP)."
        );
        event.target.value = null; // Reset file input
        return;
      }

      // Check file size limit (1MB)
      if (selectedFile.size > MAX_FILE_SIZE) {
        setFileError(
          `File too large. Maximum size is 10MB. Your file is ${formatFileSize(
            selectedFile.size
          )}.`
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
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleFlipAll = () => {
    const allFlipped = Array(flashcards.length).fill(!flipped[0]);
    setFlipped(allFlipped);
  };

  const handleSubmit = async () => {
    if (inputMethod === 0) {
      // Text mode
      if (!text.trim()) {
        alert("Please enter some text to generate summary notes.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: text.trim(),
            language,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate summary notes");
        }

        const data = await response.json();
        // Ensure we're getting the flashcards array
        const rawFlashcards = Array.isArray(data)
          ? data
          : data.flashcards || [];

        // Clean any potential "front:" or "back:" text in the content
        const cleanedFlashcards = rawFlashcards.map((card) => ({
          front: cleanFlashcardContent(card.front),
          back: cleanFlashcardContent(card.back),
        }));

        setFlashcards(cleanedFlashcards);
        setFlipped(Array(cleanedFlashcards.length).fill(false));
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
      formData.append("language", language);

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("File processing failed");
        }

        const data = await response.json();
        // Ensure we're getting the flashcards array
        const rawFlashcards = Array.isArray(data)
          ? data
          : data.flashcards || [];

        // Clean any potential "front:" or "back:" text in the content
        const cleanedFlashcards = rawFlashcards.map((card) => ({
          front: cleanFlashcardContent(card.front),
          back: cleanFlashcardContent(card.back),
        }));

        setFlashcards(cleanedFlashcards);
        setFlipped(Array(cleanedFlashcards.length).fill(false));
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
    router.push("/notes");
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
          mb: 2,
          background: "linear-gradient(120deg, #EBF4FF 0%, #F5F8FF 100%)",
        }}
      >
        <Box sx={{ p: { xs: 1.5, md: 2 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
              flexDirection: { xs: "column", sm: "row" },
              gap: 0.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <AutoAwesomeIcon
                sx={{ fontSize: 20, mr: 0.5, color: "#3f51b5" }}
              />
              <Typography
                variant="h6"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: "#3f51b5",
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                }}
              >
                {t("generateSummaryNotes")}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<ViewListIcon sx={{ fontSize: 18 }} />}
              onClick={handleViewSavedNotes}
              disabled={!isSignedIn}
              sx={{
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.85rem",
                borderColor: "#3f51b5",
                color: "#3f51b5",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#3949ab",
                  backgroundColor: "rgba(63, 81, 181, 0.04)",
                },
                "&:disabled": {
                  borderColor: "#9fa8da",
                  color: "#9fa8da",
                },
              }}
            >
              {t("viewNotes")}
            </Button>
          </Box>

          <Paper
            elevation={0}
            sx={{
              mb: 1.5,
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
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
              sx={{
                minHeight: 36,
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTabs-indicator": {
                  backgroundColor: "#3f51b5",
                  height: 2,
                },
                "& .Mui-selected": {
                  color: "#3f51b5 !important",
                  fontWeight: 600,
                },
                "& .MuiTab-root": {
                  minHeight: 36,
                },
              }}
            >
              <Tab
                icon={<TextFieldsIcon sx={{ fontSize: "1rem" }} />}
                label={t("typeOrPaste")}
                sx={{
                  textTransform: "none",
                  fontSize: "0.8rem",
                  py: 1,
                }}
              />
              <Tab
                icon={<AttachFileIcon sx={{ fontSize: "1rem" }} />}
                label={t("uploadFile")}
                sx={{
                  textTransform: "none",
                  fontSize: "0.8rem",
                  py: 1,
                }}
                disabled={!isSignedIn}
              />
            </Tabs>

            {inputMethod === 0 && (
              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: "white",
                  borderRadius: "0 0 8px 8px",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 500,
                    color: "#546e7a",
                    fontSize: "0.85rem",
                  }}
                >
                  {t("enterTextBelow")}
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid #E0E7FF",
                    "& .quill": {
                      borderRadius: 2,
                      "& .ql-toolbar": {
                        borderTop: "none",
                        borderLeft: "none",
                        borderRight: "none",
                        borderBottom: "1px solid #E0E7FF",
                        borderRadius: "8px 8px 0 0",
                        backgroundColor: "#F8FAFF",
                        padding: "4px 8px",
                        "& .ql-formats": {
                          marginRight: "4px",
                        },
                        "& button": {
                          width: "24px",
                          height: "24px",
                        },
                      },
                      "& .ql-container": {
                        borderBottom: "none",
                        borderLeft: "none",
                        borderRight: "none",
                        minHeight: "100px",
                        fontSize: "0.9rem",
                        "& .ql-editor": {
                          minHeight: "100px",
                          padding: "8px",
                        },
                      },
                    },
                  }}
                >
                  <ReactQuill
                    value={text}
                    onChange={setText}
                    modules={modules}
                    formats={formats}
                    placeholder={t("enterText")}
                  />
                </Paper>
                {!isSignedIn && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      display: "block",
                      textAlign: "center",
                      fontSize: "0.7rem",
                    }}
                  >
                    Sign in to unlock all features: file upload, saving cards,
                    and more!
                  </Typography>
                )}
              </Box>
            )}

            {inputMethod === 1 && (
              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: "white",
                  borderRadius: "0 0 8px 8px",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    textAlign: "center",
                    fontWeight: 500,
                    color: "#546e7a",
                    fontSize: "0.85rem",
                  }}
                >
                  {t("supportedFileTypes")}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 2,
                    border: "2px dashed #E0E7FF",
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: "#F8FAFF",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "#3f51b5",
                      backgroundColor: "#F5F8FF",
                    },
                  }}
                >
                  <CloudUploadIcon
                    sx={{ fontSize: 36, color: "#3f51b5", mb: 1 }}
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
                      startIcon={<AttachFileIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        mb: 1,
                        borderRadius: 2,
                        px: 2,
                        py: 0.75,
                        fontSize: "0.85rem",
                        backgroundColor: "#4c5fce",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#3949ab",
                          transform: "translateY(-2px)",
                          boxShadow: "0 6px 15px rgba(63, 81, 181, 0.25)",
                        },
                      }}
                    >
                      {t("selectFile")}
                    </Button>
                  </label>

                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    {t("dragAndDrop")}
                  </Typography>

                  {file && (
                    <Box sx={{ mt: 3, width: "100%", maxWidth: 500 }}>
                      <Fade in={!!file}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            borderColor: "#E0E7FF",
                            backgroundColor: "white",
                          }}
                        >
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
                                sx={{ mr: 1.5, color: "#3f51b5" }}
                              />
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: "medium",
                                  mr: 2,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {file.name}
                              </Typography>
                            </Box>
                            <Tooltip title="Remove file">
                              <IconButton
                                onClick={handleRemoveFile}
                                size="small"
                                sx={{
                                  color: "#f44336",
                                  "&:hover": {
                                    backgroundColor: "rgba(244, 67, 54, 0.08)",
                                  },
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mt: 1.5,
                            }}
                          >
                            <Chip
                              label={
                                file.type.split("/")[1]?.toUpperCase() ||
                                "Unknown"
                              }
                              size="small"
                              sx={{
                                backgroundColor: "#E0E7FF",
                                color: "#3949ab",
                                fontWeight: 500,
                              }}
                            />
                            <Typography variant="body2" color="textSecondary">
                              {formatFileSize(file.size)}
                            </Typography>
                          </Box>
                        </Paper>
                      </Fade>
                    </Box>
                  )}

                  {fileError && (
                    <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                      {fileError}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Paper>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
            sx={{
              py: 1,
              mt: 1,
              mb: 0.5,
              borderRadius: 2,
              fontSize: "0.9rem",
              fontWeight: 600,
              boxShadow: "0 8px 20px rgba(63, 81, 181, 0.25)",
              backgroundColor: "#4c5fce",
              textTransform: "none",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#3949ab",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 25px rgba(63, 81, 181, 0.35)",
              },
              "&:disabled": {
                backgroundColor: "#9fa8da",
                color: "white",
              },
            }}
            disabled={
              loading ||
              (inputMethod === 0 && !text.trim()) ||
              (inputMethod === 1 && !file)
            }
            startIcon={
              loading ? null : <AutoAwesomeIcon sx={{ fontSize: 18 }} />
            }
          >
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.25,
                }}
              >
                <CircularProgress size={16} sx={{ color: "white" }} />
                <Typography
                  variant="caption"
                  sx={{ mt: 0.25, color: "white", fontSize: "0.75rem" }}
                >
                  {loadingMessage || "Generating your flashcards..."}
                </Typography>
              </Box>
            ) : (
              t("generateSummaryNotes", "Generate Summary Notes")
            )}
          </Button>
        </Box>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 1,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            color: "#3f51b5",
            display: "flex",
            alignItems: "center",
            padding: 3,
          }}
        >
          <SaveIcon sx={{ mr: 1 }} /> Save Summary Notes Set
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <DialogContentText sx={{ mb: 2, color: "#546e7a" }}>
            Enter a descriptive name for your summary notes set. Choose a clear,
            specific name to track performance and generate reviews.
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
            helperText="Example: 'React Hooks Fundamentals' or 'World War II Key Events'"
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#3f51b5",
                },
              },
            }}
          />
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Add Tags"
              placeholder="Type and press Enter"
              fullWidth
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleTagAdd}
              variant="outlined"
              sx={{
                mb: 1.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: "#3f51b5",
                  },
                },
              }}
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleTagDelete(tag)}
                  color="primary"
                  sx={{
                    borderRadius: "16px",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#3949ab",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              textTransform: "none",
              color: "#546e7a",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "rgba(84, 110, 122, 0.08)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={saveFlashcards}
            variant="contained"
            disabled={savingFlashcards}
            startIcon={
              savingFlashcards ? <CircularProgress size={20} /> : <SaveIcon />
            }
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(63, 81, 181, 0.2)",
              backgroundColor: "#4c5fce",
              "&:hover": {
                backgroundColor: "#3949ab",
              },
            }}
          >
            {savingFlashcards ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {flashcards.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
            background: "linear-gradient(120deg, #F5F8FF 0%, #FFFFFF 100%)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 700,
                color: "#3f51b5",
                display: "flex",
                alignItems: "center",
                fontSize: { xs: "1.25rem", md: "1.5rem" },
              }}
            >
              <AutoAwesomeIcon sx={{ mr: 1, fontSize: 18 }} />
              Generated Summary Notes
            </Typography>

            <Tooltip title="Flip all cards">
              <IconButton
                onClick={handleFlipAll}
                sx={{
                  color: "#3f51b5",
                  border: "1px solid #E0E7FF",
                  "&:hover": {
                    backgroundColor: "#E0E7FF",
                  },
                  padding: 1,
                }}
              >
                <FlipIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography
            sx={{
              mb: 2,
              color: "#546e7a",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
            }}
          >
            <span>📚 Tap on a card to flip and see more details</span>
          </Typography>

          <Grid container spacing={2}>
            {flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in={true} timeout={300 + index * 100}>
                  <Card
                    onClick={(e) => {
                      // Don't flip if the click was on the text-to-speech button or its children
                      if (
                        e.target.closest(".MuiTooltip-popper") ||
                        e.target.closest("button")
                      ) {
                        return;
                      }

                      const newFlipped = [...flipped];
                      newFlipped[index] = !newFlipped[index];
                      setFlipped(newFlipped);
                    }}
                    sx={{
                      height: 200,
                      borderRadius: 3,
                      background: "white",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 12px 30px rgba(63, 81, 181, 0.15)",
                      },
                      position: "relative",
                      overflow: "visible",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "#3f51b5",
                        opacity: 0.7,
                        transition: "all 0.3s ease",
                      },
                      "&:hover::after": {
                        transform: "scale(1.5)",
                        opacity: 1,
                      },
                    }}
                  >
                    <TextToSpeech
                      text={
                        typeof flashcard === "string"
                          ? cleanFlashcardContent(flashcard)
                          : flipped[index]
                          ? cleanFlashcardContent(flashcard.back)
                          : cleanFlashcardContent(flashcard.front)
                      }
                      language={language}
                      tooltipText={
                        flipped[index]
                          ? t(
                              "accessibility.textToSpeech.speakBack",
                              "Speak answer"
                            )
                          : t(
                              "accessibility.textToSpeech.speakFront",
                              "Speak question"
                            )
                      }
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 10,
                        backgroundColor: "rgba(255,255,255,0.7)",
                        borderRadius: "50%",
                      }}
                    />

                    <CardContent sx={{ height: "100%", p: 0 }}>
                      <Box sx={{ perspective: "1000px", height: "100%" }}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            position: "relative",
                            transformStyle: "preserve-3d",
                            transition:
                              "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            transform: flipped[index]
                              ? "rotateY(180deg)"
                              : "rotateY(0deg)",
                          }}
                        >
                          {/* Front of card */}
                          <Box
                            sx={{
                              position: "absolute",
                              width: "100%",
                              height: "100%",
                              backfaceVisibility: "hidden",
                              p: 3,
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                flex: 1,
                                overflow: "auto",
                                fontSize: "1.1rem",
                                lineHeight: 1.5,
                                color: "#2c3e50",
                              }}
                            >
                              {typeof flashcard === "string"
                                ? cleanFlashcardContent(flashcard)
                                : cleanFlashcardContent(flashcard.front)}
                            </Typography>
                          </Box>

                          {/* Back of card */}
                          <Box
                            sx={{
                              position: "absolute",
                              width: "100%",
                              height: "100%",
                              backfaceVisibility: "hidden",
                              transform: "rotateY(180deg)",
                              p: 3,
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                flex: 1,
                                overflow: "auto",
                                fontSize: "1.1rem",
                                lineHeight: 1.5,
                                color: "#2c3e50",
                              }}
                            >
                              {typeof flashcard === "string"
                                ? cleanFlashcardContent(flashcard)
                                : cleanFlashcardContent(flashcard.back)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "center",
              gap: 2,
              flexWrap: { xs: "wrap", sm: "nowrap" },
            }}
          >
            <Button
              variant="contained"
              onClick={handleOpenDialog}
              startIcon={<SaveIcon />}
              disabled={!isSignedIn}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                boxShadow: "0 6px 15px rgba(63, 81, 181, 0.2)",
                backgroundColor: "#4c5fce",
                transition: "all 0.3s ease",
                flex: { xs: "1 1 100%", sm: "initial" },
                mb: { xs: 2, sm: 0 },
                "&:hover": {
                  backgroundColor: "#3949ab",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 20px rgba(63, 81, 181, 0.3)",
                },
                "&:disabled": {
                  backgroundColor: "#9fa8da",
                  color: "white",
                },
              }}
            >
              Save Summary Notes
            </Button>
            <Button
              variant="outlined"
              onClick={handleViewSavedNotes}
              startIcon={<ViewListIcon />}
              disabled={!isSignedIn}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                borderColor: "#3f51b5",
                color: "#3f51b5",
                transition: "all 0.3s ease",
                flex: { xs: "1 1 100%", sm: "initial" },
                "&:hover": {
                  borderColor: "#3949ab",
                  backgroundColor: "rgba(63, 81, 181, 0.04)",
                },
                "&:disabled": {
                  borderColor: "#9fa8da",
                  color: "#9fa8da",
                },
              }}
            >
              View Saved Notes
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}
