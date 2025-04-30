"use client";

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
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { Suspense, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import NotesIcon from "@mui/icons-material/Notes";
import CreateIcon from "@mui/icons-material/Create";
import QuizIcon from "@mui/icons-material/Quiz";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";

function NavigationBarContent() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  const isActive = (path) => pathname === path;

  const navigationItems = [
    { path: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { path: "/notes", label: "My Notes", icon: <NotesIcon /> },
    { path: "/generate", label: "Generate Notes", icon: <CreateIcon /> },
    { path: "/practice", label: "Practice Tests", icon: <QuizIcon /> },
    { path: "/saved-reviews", label: "Saved Reviews", icon: <BookmarkIcon /> },
    {
      path: "/study-mate/chat",
      label: "Study Chat",
      icon: <ChatIcon />,
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
          p: 2,
        },
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ color: "#3f51b5", fontWeight: "bold" }}>
          StudyMate
        </Typography>
        <IconButton onClick={() => setDrawerOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List>
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
                borderRadius: 1,
                mb: 1,
                bgcolor: isActive(item.path)
                  ? "rgba(63, 81, 181, 0.08)"
                  : "transparent",
                "&:hover": {
                  bgcolor: "rgba(63, 81, 181, 0.12)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? "#3f51b5" : "inherit",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  color: isActive(item.path) ? "#3f51b5" : "inherit",
                  "& .MuiListItemText-primary": {
                    fontWeight: isActive(item.path) ? 600 : 400,
                  },
                }}
              />
            </ListItem>
          </Link>
        ))}
      </List>

      <Box
        sx={{
          mt: "auto",
          pt: 2,
          borderTop: "1px solid #eaeaea",
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
        position="static"
        elevation={0}
        sx={{ backgroundColor: "#fff", borderBottom: "1px solid #eaeaea" }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, color: "#3f51b5", fontWeight: "bold" }}
          >
            StudyMate
          </Typography>
          <Box sx={{ width: 100, display: "flex", justifyContent: "flex-end" }}>
            <Box
              sx={{
                width: 35,
                height: 35,
                bgcolor: "grey.200",
                borderRadius: "50%",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  if (!isSignedIn) {
    return (
      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: "#fff", borderBottom: "1px solid #eaeaea" }}
      >
        <Toolbar>
          <Link
            href="/"
            passHref
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, color: "#3f51b5", fontWeight: "bold" }}
            >
              StudyMate
            </Typography>
          </Link>
          {!isMobile && (
            <>
              <Link
                href="/generate"
                passHref
                style={{ textDecoration: "none" }}
              >
                <Button
                  sx={{
                    color: isActive("/generate") ? "#3f51b5" : "#666",
                    borderRadius: 0,
                    px: 2,
                    mr: 2,
                  }}
                >
                  Generate Notes
                </Button>
              </Link>
              <Link href="/pricing" passHref style={{ textDecoration: "none" }}>
                <Button
                  sx={{
                    color: isActive("/pricing") ? "#3f51b5" : "#666",
                    borderRadius: 0,
                    px: 2,
                    mr: 2,
                  }}
                >
                  Pricing
                </Button>
              </Link>
            </>
          )}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button color="inherit" href="/sign-in" sx={{ color: "#3f51b5" }}>
              Sign In
            </Button>
            <Button variant="contained" href="/sign-up" sx={{ ml: 2 }}>
              Get Started
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: "#fff", borderBottom: "1px solid #eaeaea" }}
      >
        <Toolbar>
          {isMobile ? (
            <>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 2, color: "#3f51b5" }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                sx={{ color: "#3f51b5", fontWeight: "bold", flexGrow: 1 }}
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
                  sx={{ color: "#3f51b5", fontWeight: "bold" }}
                >
                  StudyMate
                </Typography>
              </Link>

              <Box sx={{ flexGrow: 1, display: "flex", gap: 0.5, ml: 4 }}>
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
                            ? "#3f51b5"
                            : "#666",
                        borderBottom:
                          isActive(item.path) || item.highlight
                            ? "2px solid #3f51b5"
                            : "none",
                        borderRadius: 0,
                        px: 2,
                        py: 1,
                        textTransform: "none",
                        fontSize: "0.9rem",
                        fontWeight:
                          isActive(item.path) || item.highlight ? 600 : 400,
                        opacity:
                          isActive(item.path) || item.highlight ? 1 : 0.8,
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          backgroundColor: "rgba(63, 81, 181, 0.08)",
                          opacity: 1,
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </Box>
            </>
          )}

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <UserButton afterSignOutUrl="/" />
            </Box>
          )}
        </Toolbar>
      </AppBar>
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
          position="static"
          elevation={0}
          sx={{ backgroundColor: "#fff", borderBottom: "1px solid #eaeaea" }}
        >
          <Toolbar>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, color: "#3f51b5", fontWeight: "bold" }}
            >
              StudyMate
            </Typography>
            <Box
              sx={{ width: 100, display: "flex", justifyContent: "flex-end" }}
            >
              <CircularProgress size={24} />
            </Box>
          </Toolbar>
        </AppBar>
      }
    >
      <NavigationBarContent />
    </Suspense>
  );
}
