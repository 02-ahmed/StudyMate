"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, useUser, UserButton } from "@clerk/nextjs";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

function NavigationBar() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  // Don't render anything until Clerk is loaded to prevent flickering
  if (!isLoaded) {
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
          <Button color="inherit" href="/sign-in" sx={{ color: "#3f51b5" }}>
            Sign In
          </Button>
          <Button variant="contained" href="/sign-up" sx={{ ml: 2 }}>
            Get Started
          </Button>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ backgroundColor: "#fff", borderBottom: "1px solid #eaeaea" }}
    >
      <Toolbar>
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

        <Box sx={{ flexGrow: 1, display: "flex", gap: 2, ml: 4 }}>
          <Link href="/dashboard" passHref style={{ textDecoration: "none" }}>
            <Button
              sx={{
                color: isActive("/dashboard") ? "#3f51b5" : "#666",
                borderBottom: isActive("/dashboard")
                  ? "2px solid #3f51b5"
                  : "none",
                borderRadius: 0,
                px: 2,
              }}
            >
              Dashboard
            </Button>
          </Link>
          <Link href="/notes" passHref style={{ textDecoration: "none" }}>
            <Button
              sx={{
                color: isActive("/notes") ? "#3f51b5" : "#666",
                borderBottom: isActive("/notes") ? "2px solid #3f51b5" : "none",
                borderRadius: 0,
                px: 2,
              }}
            >
              My Notes
            </Button>
          </Link>
          <Link href="/generate" passHref style={{ textDecoration: "none" }}>
            <Button
              sx={{
                color: isActive("/generate") ? "#3f51b5" : "#666",
                borderBottom: isActive("/generate")
                  ? "2px solid #3f51b5"
                  : "none",
                borderRadius: 0,
                px: 2,
              }}
            >
              Generate Notes
            </Button>
          </Link>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <UserButton afterSignOutUrl="/" />
        </Box>
      </Toolbar>
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
    </AppBar>
  );
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <NavigationBar />
          <Box
            component="main"
            sx={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#f5f5f5" }}
          >
            {children}
          </Box>
        </body>
      </html>
    </ClerkProvider>
  );
}
