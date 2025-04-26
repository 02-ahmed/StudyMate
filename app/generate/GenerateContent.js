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
  IconButton,
  Tooltip,
  Fade,
  Divider,
} from "@mui/material";
import {
  collection,
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
import SaveIcon from "@mui/icons-material/Save";
import ViewListIcon from "@mui/icons-material/ViewList";
import FlipIcon from "@mui/icons-material/Flip";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

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
    ['bold', 'italic', 'underline'],
    
    ['blockquote', 'code-block'],
  ],
};

const formats = ['bold', 'italic', 'underline', 'blockquote', 'code-block'];
export default function GenerateContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flipped, setFlipped] = useState([]);
  const [text, setText] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [setName, setSetName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [inputMethod, setInputMethod] = useState(0); // 0 for text, 1 for file
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  
  // Define allowed file types
  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        setFileError("Unsupported file type. Please upload a PDF, Word document, or PowerPoint presentation.");
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
    if (fileInput) fileInput.value = '';
  };
  
  const handleFlipAll = () => {
    const allFlipped = Array(flashcards.length).fill(!flipped[0]);
    setFlipped(allFlipped);
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
        setFlipped(Array(data.length).fill(false));
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
        
        // Generate flashcards from the summary
        const summaryResponse = await fetch("/api/generate", {
          method: "POST",
          body: data.text,
        });
        
        if (!summaryResponse.ok) {
          throw new Error("Failed to generate summary notes from file");
        }
        
        const summaryData = await summaryResponse.json();
        setFlashcards(summaryData);
        setFlipped(Array(summaryData.length).fill(false));
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
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
          mb: 4,
          background: 'linear-gradient(120deg, #EBF4FF 0%, #F5F8FF 100%)',
        }}
      >
        <Box sx={{ p: { xs: 3, md: 5 } }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 4,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AutoAwesomeIcon sx={{ fontSize: 28, mr: 1.5, color: '#3f51b5' }} />
              <Typography
                variant="h4"
                component="h1"
                sx={{ 
                  fontWeight: 700, 
                  color: '#3f51b5',
                  fontSize: { xs: '1.75rem', md: '2.125rem' }
                }}
              >
                Generate Summary Notes
              </Typography>
            </Box>
            
            
          </Box>
          
          {/* Input Method Tabs */}
          <Paper 
            elevation={0} 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            <Tabs
              value={inputMethod}
              onChange={(e, newValue) => setInputMethod(newValue)}
              variant="fullWidth"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTabs-indicator': {
                  backgroundColor: '#3f51b5',
                  height: 3
                },
                '& .Mui-selected': {
                  color: '#3f51b5 !important',
                  fontWeight: 600
                }
              }}
            >
              <Tab 
                icon={<TextFieldsIcon />} 
                label="Type or Paste" 
                sx={{ 
                  textTransform: 'none', 
                  fontSize: '1rem',
                  py: 2
                }} 
              />
              <Tab 
                icon={<AttachFileIcon />} 
                label="Upload File" 
                sx={{ 
                  textTransform: 'none', 
                  fontSize: '1rem',
                  py: 2
                }} 
              />
            </Tabs>
            
            {/* Text Input */}
            {inputMethod === 0 && (
              <Box sx={{ p: 3, backgroundColor: "white", borderRadius: '0 0 8px 8px' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, color: '#546e7a' }}>
                  Enter your text below to generate summary notes
                </Typography>
                <Paper
                  elevation={0}
                  sx={{ 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    border: '1px solid #E0E7FF',
                    '& .quill': {
                      borderRadius: 2,
                      '& .ql-toolbar': {
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderBottom: '1px solid #E0E7FF',
                        borderRadius: '8px 8px 0 0',
                        backgroundColor: '#F8FAFF'
                      },
                      '& .ql-container': {
                        borderBottom: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        minHeight: '200px',
                        fontSize: '1rem',
                        '& .ql-editor': {
                          minHeight: '200px',
                        }
                      }
                    }
                  }}
                >
                  <ReactQuill
                    value={text}
                    onChange={setText}
                    modules={modules}
                    formats={formats}
                    placeholder="Enter text..."
                  />
                </Paper>
              </Box>
            )}
            
            {/* File Upload */}
            {inputMethod === 1 && (
              <Box sx={{ p: 3, backgroundColor: "white", borderRadius: '0 0 8px 8px' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, textAlign: "center", fontWeight: 500, color: '#546e7a' }}>
                  Supported file types: PDF, Word, PowerPoint, Text
                </Typography>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    p: 4, 
                    border: '2px dashed #E0E7FF', 
                    borderRadius: 2, 
                    mb: 3,
                    backgroundColor: '#F8FAFF',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#3f51b5',
                      backgroundColor: '#F5F8FF'
                    }
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 64, color: '#3f51b5', mb: 2 }} />
                  
                  <input
                    accept=".pdf,.txt,.ppt,.pptx,.doc,.docx"
                    style={{ display: 'none' }}
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload">
                    <Button 
                      variant="contained" 
                      component="span"
                      startIcon={<AttachFileIcon />}
                      sx={{ 
                        mb: 2, 
                        borderRadius: 2,
                        px: 3,
                        py: 1.2,
                        backgroundColor: '#4c5fce',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#3949ab',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 15px rgba(63, 81, 181, 0.25)'
                        }
                      }}
                    >
                      Select File
                    </Button>
                  </label>
                  
                  <Typography variant="body2" color="textSecondary">
                    Drag and drop or click to browse
                  </Typography>
                  
                  {file && (
                    <Box sx={{ mt: 3, width: '100%', maxWidth: 500 }}>
                      <Fade in={!!file}>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2,
                            borderRadius: 2,
                            borderColor: '#E0E7FF',
                            backgroundColor: 'white'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                              <InsertDriveFileIcon sx={{ mr: 1.5, color: '#3f51b5' }} />
                              <Typography variant="body1" sx={{ fontWeight: 'medium', mr: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {file.name}
                              </Typography>
                            </Box>
                            <Tooltip title="Remove file">
                              <IconButton 
                                onClick={handleRemoveFile} 
                                size="small"
                                sx={{ 
                                  color: '#f44336',
                                  '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.08)' }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                            <Chip 
                              label={file.type.split('/')[1].toUpperCase() || 'Unknown type'} 
                              size="small"
                              sx={{ 
                                backgroundColor: '#E0E7FF', 
                                color: '#3949ab',
                                fontWeight: 500
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
                    <Typography 
                      variant="body2" 
                      color="error"
                      sx={{ mt: 2 }}
                    >
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
              py: 1.5, 
              mt: 2,
              mb: 2,
              borderRadius: 2,
              fontSize: '1.05rem',
              fontWeight: 600,
              boxShadow: '0 8px 20px rgba(63, 81, 181, 0.25)',
              backgroundColor: '#4c5fce',
              textTransform: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#3949ab',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(63, 81, 181, 0.35)'
              },
              '&:disabled': {
                backgroundColor: '#9fa8da',
                color: 'white'
              }
            }}
            disabled={loading || (inputMethod === 0 && !text.trim()) || (inputMethod === 1 && !file)}
            startIcon={loading ? null : <AutoAwesomeIcon />}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              "Generate Summary Notes"
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
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          color: '#3f51b5',
          display: 'flex', 
          alignItems: 'center',
          padding: 3
        }}>
          <BookmarkIcon sx={{ mr: 1 }} /> Save Summary Notes Set
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <DialogContentText sx={{ mb: 2 }}>
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
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: '#3f51b5',
                },
              }
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
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#3f51b5',
                  },
                }
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
                    borderRadius: '16px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#3949ab'
                    }
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
              textTransform: 'none',
              color: '#546e7a',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgba(84, 110, 122, 0.08)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={saveFlashcards} 
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ 
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(63, 81, 181, 0.2)',
              backgroundColor: '#4c5fce',
              '&:hover': {
                backgroundColor: '#3949ab'
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {flashcards.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Paper
            elevation={0}
            sx={{ 
              p: { xs: 3, md: 5 }, 
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
              background: 'linear-gradient(120deg, #F5F8FF 0%, #FFFFFF 100%)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography
                variant="h5"
                component="h2"
                sx={{ 
                  fontWeight: 700, 
                  color: '#3f51b5', 
                  display: 'flex', 
                  alignItems: 'center' 
                }}
              >
                <AutoAwesomeIcon sx={{ mr: 1, fontSize: 20 }} />
                Generated Summary Notes
              </Typography>
              
              <Tooltip title="Flip all cards">
                <IconButton 
                  onClick={handleFlipAll}
                  sx={{ 
                    color: '#3f51b5',
                    border: '1px solid #E0E7FF',
                    '&:hover': {
                      backgroundColor: '#E0E7FF'
                    }
                  }}
                >
                  <FlipIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Typography 
              sx={{ 
                mb: 3, 
                color: '#546e7a',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem'
              }}
            >
              <span>📚 Tap on a card to flip and see more details</span>
            </Typography>
            
            <Grid container spacing={3}>
              {flashcards.map((summaryNote, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Fade in={true} timeout={300 + index * 100}>
                    <Card
                      onClick={() => {
                        const newFlipped = [...flipped];
                        newFlipped[index] = !newFlipped[index];
                        setFlipped(newFlipped);
                      }}
                      sx={{
                        height: 240,
                        borderRadius: 3,
                        background: 'white',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: '0 12px 30px rgba(63, 81, 181, 0.15)',
                        },
                        position: 'relative',
                        overflow: 'visible',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#3f51b5',
                          opacity: 0.7,
                          transition: 'all 0.3s ease',
                        },
                        '&:hover::after': {
                          transform: 'scale(1.5)',
                          opacity: 1,
                        }
                      }}
                    >
                      <CardContent sx={{ height: '100%', p: 0 }}>
                        <Box sx={{ perspective: '1000px', height: '100%' }}>
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              position: 'relative',
                              transformStyle: 'preserve-3d',
                              transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                              transform: flipped[index]
                                ? 'rotateY(180deg)'
                                : 'rotateY(0deg)',
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                backfaceVisibility: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#fff',
                                borderRadius: 3,
                                border: '1px solid rgba(63, 81, 181, 0.1)',
                                padding: 3,
                                boxSizing: 'border-box',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                                overflowY: 'auto',
                                '&::-webkit-scrollbar': {
                                  width: '6px',
                                },
                                '&::-webkit-scrollbar-track': {
                                  background: '#f1f1f1',
                                  borderRadius: '3px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                  background: '#3f51b5',
                                  borderRadius: '3px',
                                  '&:hover': {
                                    background: '#303f9f',
                                  },
                                },
                              }}
                            >
                              <Typography 
                                variant="overline" 
                                sx={{ 
                                  color: '#3f51b5', 
                                  opacity: 0.7, 
                                  mb: 1,
                                  letterSpacing: 1
                                }}
                              >
                                CONCEPT
                              </Typography>
                              <Typography
                                variant="body1"
                                component="div"
                                sx={{
                                  wordBreak: 'break-word',
                                  whiteSpace: 'pre-wrap',
                                  maxWidth: '100%',
                                  fontSize: '1.1rem',
                                  color: '#37474f',
                                  fontWeight: 500,
                                  textAlign: 'center',
                                  lineHeight: 1.5,
                                }}
                              >
                                {summaryNote.front}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                backfaceVisibility: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#fff',
                                borderRadius: 3,
                                border: '1px solid rgba(63, 81, 181, 0.1)',
                                padding: 3,
                                boxSizing: 'border-box',
                                transform: 'rotateY(180deg)',
                                background: 'linear-gradient(135deg, #EBF4FF 0%, #F8FBFF 100%)',
                                background: 'linear-gradient(135deg, #EBF4FF 0%, #F8FBFF 100%)',
                                overflowY: 'auto',
                                '&::-webkit-scrollbar': {
                                  width: '6px',
                                },
                                '&::-webkit-scrollbar-track': {
                                  background: '#f1f1f1',
                                  borderRadius: '3px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                  background: '#3f51b5',
                                  borderRadius: '3px',
                                  '&:hover': {
                                    background: '#303f9f',
                                  },
                                },
                              }}
                            >
                              <Typography 
                                variant="overline" 
                                sx={{ 
                                  color: '#3f51b5', 
                                  opacity: 0.7, 
                                  mb: 1,
                                  letterSpacing: 1 
                                }}
                              >
                                DETAILS
                              </Typography>
                              <Typography
                                variant="body1"
                                component="div"
                                sx={{
                                  wordBreak: 'break-word',
                                  whiteSpace: 'pre-wrap',
                                  maxWidth: '100%',
                                  fontSize: '1rem',
                                  color: '#37474f',
                                  fontWeight: 400,
                                  textAlign: 'center',
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
                  </Fade>
                </Grid>
              ))}
            </Grid>
            
            <Box
              sx={{
                mt: 5,
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
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
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: '0 6px 15px rgba(63, 81, 181, 0.2)',
                  backgroundColor: '#4c5fce',
                  transition: 'all 0.3s ease',
                  flex: { xs: '1 1 100%', sm: 'initial' },
                  mb: { xs: 2, sm: 0 },
                  '&:hover': {
                    backgroundColor: '#3949ab',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(63, 81, 181, 0.3)'
                  },
                  '&:disabled': {
                    backgroundColor: '#9fa8da',
                    color: 'white'
                  }
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
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  borderColor: '#3f51b5',
                  color: '#3f51b5',
                  transition: 'all 0.3s ease',
                  flex: { xs: '1 1 100%', sm: 'initial' },
                  '&:hover': {
                    borderColor: '#3949ab',
                    backgroundColor: 'rgba(63, 81, 181, 0.04)'
                  },
                  '&:disabled': {
                    borderColor: '#9fa8da',
                    color: '#9fa8da'
                  }
                }}
              >
                View Saved Notes
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Container>
  );
}