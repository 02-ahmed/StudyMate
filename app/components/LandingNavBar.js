"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLanguage } from "../contexts/LanguageContext";
import useTranslation from "../hooks/useTranslation";
import LandingLanguageSelector from "./LandingLanguageSelector";

export default function LandingNavBar() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // xs only (0-599px)
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg")); // sm, md (600-1199px)
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg")); // lg and xl (1200px+)
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "white",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: 70 }}>
          {/* Logo */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: { xs: 0, sm: 0 },
              mr: { xs: 2, sm: 4 },
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

          {/* DESKTOP Navigation */}
          {isDesktop ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                flexGrow: 1,
                justifyContent: "flex-end",
              }}
            >
              {/* Navigation Links */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  mr: 4,
                }}
              >
                <Link
                  href="/question-vault"
                  passHref
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    sx={{
                      color: "#374151",
                      fontWeight: 500,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      "&:hover": {
                        color: "#1F2937",
                      },
                    }}
                  >
                    S-Bank
                  </Typography>
                </Link>
                <Link
                  href="/study-mate/chat"
                  passHref
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    sx={{
                      color: "#374151",
                      fontWeight: 500,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      "&:hover": {
                        color: "#1F2937",
                      },
                    }}
                  >
                    StudyChat
                  </Typography>
                </Link>
                <Link
                  href="/generate"
                  passHref
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    sx={{
                      color: "#374151",
                      fontWeight: 500,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      "&:hover": {
                        color: "#1F2937",
                      },
                    }}
                  >
                    Generate
                  </Typography>
                </Link>
                <Link
                  href="/practice"
                  passHref
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    sx={{
                      color: "#374151",
                      fontWeight: 500,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      "&:hover": {
                        color: "#1F2937",
                      },
                    }}
                  >
                    Practice Tests
                  </Typography>
                </Link>
              </Box>

              {/* User Actions */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {/* Sign In Link */}
                <Link
                  href="/sign-in"
                  passHref
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    sx={{
                      color: "#3B82F6",
                      fontWeight: 500,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      "&:hover": {
                        color: "#2563EB",
                      },
                    }}
                  >
                    Sign in
                  </Typography>
                </Link>

                {/* Vertical Separator */}
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    height: 20,
                    borderColor: "#D1D5DB",
                  }}
                />

                {/* Language Selector */}
                <LandingLanguageSelector inline={true} />
              </Box>
            </Box>
          ) : isTablet ? (
            // TABLET Navigation
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                ml: "auto",
              }}
            >
              {/* Sign In Link */}
              <Link href="/sign-in" passHref style={{ textDecoration: "none" }}>
                <Typography
                  sx={{
                    color: "#3B82F6",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    "&:hover": {
                      color: "#2563EB",
                    },
                  }}
                >
                  Sign in
                </Typography>
              </Link>

              {/* Vertical Separator */}
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  height: 20,
                  borderColor: "#D1D5DB",
                }}
              />

              {/* Language Selector */}
              <LandingLanguageSelector inline={true} />

              {/* Hamburger Menu */}
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
                sx={{
                  color: "#374151",
                  ml: 1,
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          ) : (
            // MOBILE Navigation - Only Hamburger Menu
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
                sx={{
                  color: "#374151",
                  mr: -1,
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                mt: 1,
              },
            }}
          >
            <MenuItem onClick={handleMobileMenuClose}>
              <Link
                href="/question-vault"
                passHref
                style={{ textDecoration: "none", color: "inherit" }}
              >
                S-Bank
              </Link>
            </MenuItem>
            <MenuItem onClick={handleMobileMenuClose}>
              <Link
                href="/study-mate/chat"
                passHref
                style={{ textDecoration: "none", color: "inherit" }}
              >
                StudyChat
              </Link>
            </MenuItem>
            <MenuItem onClick={handleMobileMenuClose}>
              <Link
                href="/generate"
                passHref
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Generate
              </Link>
            </MenuItem>
            <MenuItem onClick={handleMobileMenuClose}>
              <Link
                href="/practice"
                passHref
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Practice Tests
              </Link>
            </MenuItem>
            <MenuItem onClick={handleMobileMenuClose}>
              <Link
                href="/sign-in"
                passHref
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Sign in
              </Link>
            </MenuItem>
            <MenuItem
              onClick={(e) => e.stopPropagation()}
              sx={{
                "&:hover": {
                  backgroundColor: "transparent",
                },
                padding: "8px 16px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                }}
              >
                <LandingLanguageSelector inline={true} />
              </Box>
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
