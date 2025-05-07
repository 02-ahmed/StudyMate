"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Badge,
} from "@mui/material";
import Image from "next/image";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";

function NavigationBarContent() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  const isActive = (path) => pathname === path;

  const navigationItems = [
    { path: "/dashboard", label: "Dashboard", icon: <DashboardOutlinedIcon /> },
    { path: "/notes", label: "Notes", icon: <NotesOutlinedIcon /> },
    {
      path: "/generate",
      label: "Generate",
      icon: <CreateOutlinedIcon />,
    },
    { path: "/practice", label: "Practice", icon: <QuizOutlinedIcon /> },
    {
      path: "/saved-reviews",
      label: "Saved",
      icon: <BookmarkBorderOutlinedIcon />,
    },
    {
      path: "/study-mate/chat",
      label: "Chat",
      icon: <ChatOutlinedIcon />,
      highlight: pathname.startsWith("/study-mate/chat"),
    },
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
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ position: "relative", width: 180, height: 50 }}>
            <Image
              src="/images/logo2.png"
              alt="StudyMate Logo"
              layout="fill"
              objectFit="contain"
              priority
            />
          </Box>
        </Box>
        <IconButton
          onClick={() => setDrawerOpen(false)}
          sx={{
            bgcolor: "rgba(79, 70, 229, 0.1)",
            "&:hover": { bgcolor: "rgba(79, 70, 229, 0.2)" },
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
        <UserButton afterSignOutUrl="/" />
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
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ height: 70 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ position: "relative", width: 180, height: 50 }}>
                <Image
                  src="/images/logo2.png"
                  alt="StudyMate Logo"
                  layout="fill"
                  objectFit="contain"
                  priority
                />
              </Box>
            </Box>
            <Box
              sx={{
                width: 40,
                display: "flex",
                justifyContent: "flex-end",
                ml: "auto",
              }}
            >
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
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ height: 70 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexGrow: { xs: 0, sm: 1 },
                mr: { xs: 2, sm: 0 },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: { xs: 140, sm: 260 },
                  height: { xs: 40, sm: 70 },
                }}
              >
                <Image
                  src="/images/logo2.png"
                  alt="StudyMate Logo"
                  layout="fill"
                  objectFit="contain"
                  priority
                />
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                ml: "auto",
                gap: { xs: 0.5, sm: 2 },
                flexWrap: { xs: "wrap", sm: "nowrap" },
                justifyContent: { xs: "flex-end", sm: "flex-start" },
              }}
            >
              <Link href="/pricing" passHref style={{ textDecoration: "none" }}>
                <Button
                  sx={{
                    color: isActive("/pricing") ? "#4f46e5" : "rgba(0,0,0,0.7)",
                    fontWeight: 500,
                    fontSize: { xs: "0.75rem", sm: "0.9rem" },
                    padding: { xs: "4px 6px", sm: "6px 16px" },
                    whiteSpace: "nowrap",
                    minWidth: { xs: "auto", sm: "auto" },
                    marginRight: { xs: 0.5, sm: 0 },
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "rgba(79, 70, 229, 0.05)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Pricing
                </Button>
              </Link>

              <Button
                color="inherit"
                href="/sign-in"
                sx={{
                  color: "#4f46e5",
                  fontSize: { xs: "0.75rem", sm: "0.9rem" },
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  minWidth: { xs: "auto", sm: 80 },
                  padding: { xs: "4px 6px", sm: "6px 16px" },
                  marginRight: { xs: 0.5, sm: 0 },
                  "&:hover": {
                    background: "rgba(79, 70, 229, 0.05)",
                  },
                }}
              >
                Sign In
              </Button>

              {/* Only show Get Started button on larger screens */}
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Button
                  variant="contained"
                  href="/sign-up"
                  sx={{
                    bgcolor: "#4f46e5",
                    fontWeight: 600,
                    fontSize: { xs: "0.75rem", sm: "0.9rem" },
                    borderRadius: "8px",
                    textTransform: "none",
                    boxShadow: "0 2px 10px rgba(79, 70, 229, 0.3)",
                    padding: { xs: "4px 6px", sm: "6px 16px" },
                    minWidth: { xs: "auto", sm: 100 },
                    whiteSpace: "nowrap",
                    "&:hover": {
                      bgcolor: "#4338ca",
                      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  Get Started
                </Button>
              </Box>
            </Box>
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
          borderBottom: "1px solid rgba(0,0,0,0.06)",
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
                    mr: 1,
                    color: "#4f46e5",
                    bgcolor: "rgba(79, 70, 229, 0.1)",
                    "&:hover": { bgcolor: "rgba(79, 70, 229, 0.2)" },
                  }}
                >
                  <MenuIcon />
                </IconButton>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexGrow: 1,
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: { xs: 120, sm: 180 },
                      height: { xs: 35, sm: 50 },
                    }}
                  >
                    <Image
                      src="/images/logo2.png"
                      alt="StudyMate Logo"
                      layout="fill"
                      objectFit="contain"
                      priority
                    />
                  </Box>
                </Box>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  passHref
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mr: 4,
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: { xs: 120, sm: 180 },
                        height: { xs: 35, sm: 50 },
                      }}
                    >
                      <Image
                        src="/images/logo2.png"
                        alt="StudyMate Logo"
                        layout="fill"
                        objectFit="contain"
                        priority
                      />
                    </Box>
                  </Box>
                </Link>

                <Box sx={{ flexGrow: 1, display: "flex", gap: 0.5 }}>
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
                          color:
                            isActive(item.path) || item.highlight
                              ? "#4f46e5"
                              : "rgba(0,0,0,0.7)",
                          fontWeight:
                            isActive(item.path) || item.highlight ? 600 : 500,
                          fontSize: "0.85rem",
                          textTransform: "none",
                          borderRadius: 2,
                          px: 1.5,
                          py: 0.75,
                          position: "relative",
                          overflow: "hidden",
                          "&:hover": {
                            backgroundColor: "rgba(79, 70, 229, 0.05)",
                          },
                          "&::after":
                            isActive(item.path) || item.highlight
                              ? {
                                  content: '""',
                                  position: "absolute",
                                  bottom: 0,
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  width: "30%",
                                  height: 3,
                                  backgroundColor: "#4f46e5",
                                  borderRadius: "3px 3px 0 0",
                                }
                              : {},
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
              <Box
                sx={{
                  ml: 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: {
                        width: 38,
                        height: 38,
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                      },
                    },
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
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ height: 70 }}>
              <Typography
                variant="h6"
                sx={{
                  flexGrow: 1,
                  color: "#4f46e5",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: { xs: 120, sm: 180 },
                    height: { xs: 35, sm: 50 },
                  }}
                >
                  <Image
                    src="/images/logo2.png"
                    alt="StudyMate Logo"
                    layout="fill"
                    objectFit="contain"
                    priority
                  />
                </Box>
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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
