"use client";

import React from "react";
import { Box, Select, MenuItem } from "@mui/material";
import TranslateIcon from "@mui/icons-material/Translate";
import { useLanguage, SUPPORTED_LANGUAGES } from "../contexts/LanguageContext";

export default function LandingLanguageSelector({ inline = false }) {
  const { language, changeLanguage } = useLanguage();

  const handleLanguageChange = (event) => {
    changeLanguage(event.target.value);
  };

  // If inline is true, render a simpler selector for use inside navigation bars
  if (inline) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <TranslateIcon sx={{ color: "#4f46e5", fontSize: 20, mr: 1 }} />
        <select
          value={language}
          onChange={handleLanguageChange}
          style={{
            border: "none",
            background: "transparent",
            color: "#4f46e5",
            fontWeight: 500,
            fontSize: "0.9rem",
            cursor: "pointer",
            padding: "4px 8px",
            outline: "none",
          }}
        >
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </Box>
    );
  }

  // Default floating selector
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        borderRadius: "20px",
        px: 1.5,
        py: 0.5,
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        position: "fixed",
        top: { xs: 80, sm: 20 },
        right: { xs: 10, sm: 20 },
        zIndex: 1000,
      }}
    >
      <TranslateIcon sx={{ color: "#4f46e5", fontSize: 20, mr: 1 }} />
      <Select
        value={language}
        onChange={handleLanguageChange}
        size="small"
        variant="standard"
        displayEmpty
        sx={{
          minWidth: 100,
          "& .MuiSelect-select": {
            py: 0.5,
            px: 0,
            color: "#4f46e5",
            fontWeight: 500,
            fontSize: "0.9rem",
          },
          "&:before, &:after": {
            display: "none",
          },
          "& .MuiSelect-icon": {
            color: "#4f46e5",
          },
        }}
      >
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
          <MenuItem key={code} value={code}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
