"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLanguage } from "../contexts/LanguageContext";
import useTranslation from "../hooks/useTranslation";
import LandingLanguageSelector from "./LandingLanguageSelector";

export default function LandingNavBar() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
        backgroundColor: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: 70 }}>
          {/* Logo */}
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

          {/* Desktop Navigation */}
          {!isMobile ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {/* Language Selector */}
              <LandingLanguageSelector inline={true} />

              {/* Pricing Button */}
              <Link href="/pricing" passHref style={{ textDecoration: "none" }}>
                <Button
                  sx={{
                    color: "rgba(0,0,0,0.7)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    padding: "6px 16px",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "rgba(79, 70, 229, 0.05)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {t("nav.pricing", "Pricing")}
                </Button>
              </Link>

              {/* Sign In Button */}
              <Button
                color="inherit"
                href="/sign-in"
                sx={{
                  color: "#4f46e5",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  minWidth: 80,
                  padding: "6px 16px",
                  "&:hover": {
                    background: "rgba(79, 70, 229, 0.05)",
                  },
                }}
              >
                {t("nav.signIn", "Sign In")}
              </Button>

              {/* Get Started Button */}
              <Button
                variant="contained"
                href="/sign-up"
                sx={{
                  bgcolor: "#4f46e5",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  borderRadius: "8px",
                  textTransform: "none",
                  boxShadow: "0 2px 10px rgba(79, 70, 229, 0.3)",
                  padding: "6px 16px",
                  minWidth: 100,
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: "#4338ca",
                    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {t("nav.getStarted", "Get Started")}
              </Button>
            </Box>
          ) : (
            // Mobile Navigation
            <>
              {/* Language Selector for Mobile */}
              <LandingLanguageSelector inline={true} />

              {/* Mobile Menu Icon */}
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
                sx={{ color: "#4f46e5" }}
              >
                <MenuIcon />
              </IconButton>

              {/* Mobile Menu */}
              <Menu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleMobileMenuClose}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <MenuItem onClick={handleMobileMenuClose}>
                  <Link
                    href="/pricing"
                    passHref
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {t("nav.pricing", "Pricing")}
                  </Link>
                </MenuItem>
                <MenuItem onClick={handleMobileMenuClose}>
                  <Link
                    href="/sign-in"
                    passHref
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {t("nav.signIn", "Sign In")}
                  </Link>
                </MenuItem>
                <MenuItem onClick={handleMobileMenuClose}>
                  <Link
                    href="/sign-up"
                    passHref
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {t("nav.getStarted", "Get Started")}
                  </Link>
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
