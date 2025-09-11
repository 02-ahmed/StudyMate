"use client";

import React from "react";
import {
  Box,
  Typography,
  Grid,
  Container,
  Link,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Image from "next/image";
import { FaInstagram, FaFacebook } from "react-icons/fa";
import useTranslation from "../hooks/useTranslation";

export default function LandingFooterRedesign() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const footerLinks = [
    { title: t("footer.about", "About us"), href: "/about" },
    { title: t("footer.terms", "Terms of Service"), href: "/terms" },
    { title: t("footer.privacy", "Privacy Policy"), href: "/privacy" },
    { title: t("footer.cookies", "Cookie Notice"), href: "/cookies" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 4, sm: 5 },
        px: { xs: 2, sm: 4, md: 6 },
        borderTop: "1px solid rgba(0, 0, 0, 0.1)",
        backgroundColor: "background.default",
      }}
    >
      <Container maxWidth="xl" disableGutters>
        {/* Top section: Logo and Social Icons */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: { xs: 3, sm: 4 } }}
        >
          <Grid item>
            <Link
              href="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <Box sx={{ position: "relative", width: 40, height: 40, mr: 1 }}>
                <Image
                  src="/redesign/studymate logo 1.png"
                  alt="StudyMate Logo"
                  layout="fill"
                  objectFit="contain"
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  background:
                    "linear-gradient(90deg, #6366F1 0%, #A855F7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                StudyMate Ai
              </Typography>
            </Link>
          </Grid>

          <Grid item>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
              >
                <FaInstagram size={24} color="#333" />
              </Link>
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
              >
                <FaFacebook size={24} color="#333" />
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Middle section: Navigation Links */}
        {isDesktop ? (
          // Desktop layout: Links in a row
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Grid item>
              <Typography variant="body2" color="text.secondary">
                &copy;2025 StudyMate. All Rights Reserved.
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: "flex", gap: { xs: 2, sm: 3, md: 4 } }}>
                {footerLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    underline="hover"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                    }}
                  >
                    {link.title}
                  </Link>
                ))}
              </Box>
            </Grid>
          </Grid>
        ) : (
          // Tablet and Mobile layout: Links in two columns
          <>
            <Grid
              container
              spacing={2}
              justifyContent="space-between"
              sx={{ mb: 3 }}
            >
              <Grid item xs={6}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Link
                    href={footerLinks[2].href}
                    underline="hover"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                    }}
                  >
                    {footerLinks[2].title}
                  </Link>
                  <Link
                    href={footerLinks[3].href}
                    underline="hover"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                    }}
                  >
                    {footerLinks[3].title}
                  </Link>
                </Box>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: "right" }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    alignItems: "flex-end",
                  }}
                >
                  <Link
                    href={footerLinks[0].href}
                    underline="hover"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                    }}
                  >
                    {footerLinks[0].title}
                  </Link>
                  <Link
                    href={footerLinks[1].href}
                    underline="hover"
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                    }}
                  >
                    {footerLinks[1].title}
                  </Link>
                </Box>
              </Grid>
            </Grid>

            {/* Copyright for tablet and mobile */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                &copy;2025 StudyMate. All Rights Reserved.
              </Typography>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
