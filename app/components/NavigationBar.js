"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  CircularProgress,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Container,
  Avatar,
  Tooltip,
  Badge
} from "@mui/material";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";

function NavigationBarContent() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (path) => pathname === path;

  const navigationItems = [
    { path: "/dashboard", label: "Dashboard", icon: <DashboardOutlinedIcon /> },
    { path: "/notes", label: "My Notes", icon: <NotesOutlinedIcon /> },
    { path: "/generate", label: "Generate", icon: <CreateOutlinedIcon /> },
    { path: "/practice", label: "Practice", icon: <QuizOutlinedIcon /> },
    { path: "/saved-reviews", label: "Saved", icon: <BookmarkBorderOutlinedIcon /> },
  ];

  const renderMobileDrawer = () => (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{
        sx: {
          width: "80%",
          maxWidth: 300,
          bgcolor: "background.paper",
          borderRadius: { xs: 0, sm: "0 16px 16px 0" },
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Typography variant="h6" sx={{ color: "#4f46e5", fontWeight: 700, letterSpacing: "-0.02em" }}>
          StudyMate
        </Typography>
        <IconButton 
          onClick={() => setDrawerOpen(false)}
          sx={{ 
            bgcolor: 'rgba(79, 70, 229, 0.1)', 
            '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.2)' } 
          }}
        >
          <CloseRoundedIcon sx={{ color: "#4f46e5" }} />
        </IconButton>
      </Box>

      <List sx={{ px: 2, py: 1 }}>
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            passHref
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <ListItem
              button
              selected={isActive(item.path)}
              onClick={() => setDrawerOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 1,
                py: 1,
                bgcolor: isActive(item.path)
                  ? "rgba(79, 70, 229, 0.08)"
                  : "transparent",
                "&:hover": {
                  bgcolor: "rgba(79, 70, 229, 0.12)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? "#4f46e5" : "rgba(0,0,0,0.6)",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  "& .MuiListItemText-primary": {
                    fontWeight: isActive(item.path) ? 600 : 500,
                    color: isActive(item.path) ? "#4f46e5" : "rgba(0,0,0,0.7)",
                  },
                }}
              />
              {isActive(item.path) && (
                <Box
                  sx={{
                    width: 4,
                    height: 32,
                    bgcolor: "#4f46e5",
                    borderRadius: "4px",
                    ml: 1,
                  }}
                />
              )}
            </ListItem>
          </Link>
        ))}
      </List>

      <Box
        sx={{
          mt: "auto",
          p: 3,
          borderTop: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <UserButton 
          afterSignOutUrl="/"
        />
      </Box>
    </Drawer>
  );

  if (!isLoaded) {
    return (
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ 
          backgroundColor: "#fff", 
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)"
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ height: 70 }}>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, color: "#4f46e5", fontWeight: 700, letterSpacing: "-0.02em" }}
            >
              StudyMate
            </Typography>
            <Box sx={{ width: 40, display: "flex", justifyContent: "flex-end" }}>
              <Box
                sx={{
                  width: 35,
                  height: 35,
                  bgcolor: "#f3f4f6",
                  borderRadius: "50%",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    );
  }

  if (!isSignedIn) {
    return (
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ 
          backgroundColor: "rgba(255,255,255,0.8)", 
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)"
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ height: 70 }}>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, color: "#4f46e5", fontWeight: 700, letterSpacing: "-0.02em" }}
            >
              StudyMate
            </Typography>
            {!isMobile && (
              <Link href="/generate" passHref style={{ textDecoration: "none" }}>
                <Button
                  sx={{
                    color: isActive("/generate") ? "#4f46e5" : "rgba(0,0,0,0.7)",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    px: 2,
                    mr: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "rgba(79, 70, 229, 0.05)",
                      transform: "translateY(-1px)"
                    }
                  }}
                >
                  Generate Notes
                </Button>
              </Link>
            )}
            <Button 
              color="inherit" 
              href="/sign-in" 
              sx={{ 
                color: "#4f46e5", 
                fontSize: "0.9rem",
                fontWeight: 600,
                "&:hover": {
                  background: "rgba(79, 70, 229, 0.05)",
                }
              }}
            >
              Sign In
            </Button>
            <Button 
              variant="contained" 
              href="/sign-up" 
              sx={{ 
                ml: 2,
                bgcolor: "#4f46e5",
                fontWeight: 600,
                fontSize: "0.9rem",
                borderRadius: "8px",
                textTransform: "none",
                boxShadow: "0 2px 10px rgba(79, 70, 229, 0.3)",
                px: 3,
                "&:hover": {
                  bgcolor: "#4338ca",
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)",
                  transform: "translateY(-1px)"
                },
                transition: "all 0.2s ease",
              }}
            >
              Get Started
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
    );
  }

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ 
          backgroundColor: "rgba(255,255,255,0.9)", 
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)"
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ height: 70 }}>
            {isMobile ? (
              <>
                <IconButton
                  edge="start"
                  aria-label="menu"
                  onClick={() => setDrawerOpen(true)}
                  sx={{ 
                    mr: 2, 
                    color: "#4f46e5",
                    bgcolor: 'rgba(79, 70, 229, 0.1)',
                    '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.2)' }
                  }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography
                  variant="h6"
                  sx={{ color: "#4f46e5", fontWeight: 700, letterSpacing: "-0.02em", flexGrow: 1 }}
                >
                  StudyMate
                </Typography>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  passHref
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Typography
                    variant="h6"
                    sx={{ 
                      color: "#4f46e5", 
                      fontWeight: 700, 
                      letterSpacing: "-0.02em",
                      mr: 4,
                      cursor: "pointer",
                      '&:hover': {
                        opacity: 0.9
                      }
                    }}
                  >
                    StudyMate
                  </Typography>
                </Link>

                <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
                  {navigationItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      passHref
                      style={{ textDecoration: "none" }}
                    >
                      <Button
                        startIcon={item.icon}
                        sx={{
                          color: isActive(item.path) ? "#4f46e5" : "rgba(0,0,0,0.7)",
                          fontWeight: isActive(item.path) ? 600 : 500,
                          fontSize: "0.9rem",
                          textTransform: "none",
                          borderRadius: 2,
                          px: 2,
                          py: 1,
                          position: "relative",
                          overflow: "hidden",
                          "&:hover": {
                            backgroundColor: "rgba(79, 70, 229, 0.05)",
                          },
                          "&::after": isActive(item.path) ? {
                            content: '""',
                            position: "absolute",
                            bottom: 0,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "30%",
                            height: 3,
                            backgroundColor: "#4f46e5",
                            borderRadius: "3px 3px 0 0",
                          } : {},
                          transition: "all 0.2s ease",
                        }}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </Box>
              </>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!isMobile && (
                <Tooltip title="Notifications">
                  <IconButton
                    sx={{ 
                      ml: 1,
                      color: "rgba(0,0,0,0.7)",
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      '&:hover': { 
                        bgcolor: 'rgba(0, 0, 0, 0.08)',
                        transform: 'translateY(-1px)'
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Badge badgeContent={3} color="error">
                      <NotificationsNoneOutlinedIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}
              
              <Box sx={{ 
                ml: 1,
                transition: "all 0.2s ease",
                '&:hover': { 
                  transform: 'translateY(-1px)'
                },
              }}>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: {
                        width: 38,
                        height: 38,
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                      }
                    }
                  }}
                />
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Add spacing below AppBar */}
      <Box sx={{ height: 70 }} />
      
      {renderMobileDrawer()}
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
    </>
  );
}

export default function NavigationBar() {
  return (
    <Suspense
      fallback={
        <AppBar
          position="fixed"
          elevation={0}
          sx={{ 
            backgroundColor: "rgba(255,255,255,0.9)", 
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(0,0,0,0.06)" 
          }}
        >
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ height: 70 }}>
              <Typography
                variant="h6"
                sx={{ flexGrow: 1, color: "#4f46e5", fontWeight: 700, letterSpacing: "-0.02em" }}
              >
                StudyMate
              </Typography>
              <Box
                sx={{ display: "flex", justifyContent: "flex-end" }}
              >
                <CircularProgress size={24} sx={{ color: "#4f46e5" }} />
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      }
    >
      <NavigationBarContent />
    </Suspense>
  );
}