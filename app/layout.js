import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Box } from "@mui/material";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Analytics } from "@vercel/analytics/react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PomodoroProvider } from "./contexts/PomodoroContext";

const inter = Inter({ subsets: ["latin"] });

// Import NavigationBar as a Client Component
const NavigationBar = dynamic(() => import("./components/NavigationBar"), {
  ssr: true,
});

// Import StoreUserInfo as a client component
const StoreUserInfo = dynamic(() => import("./components/StoreUserInfo"), {
  ssr: false,
});

// Add metadata configuration
export const metadata = {
  title: "StudyMate",
  description:
    "Unleash your potential with AI-powered flashcards, smart notes, personalized learning analytics & more",
  icons: {
    icon: [
      { url: "/images/favicon.png", sizes: "any", type: "image/png" },
      { url: "/images/logo2.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: { url: "/images/favicon.png" },
    apple: { url: "/images/favicon.png", sizes: "180x180", type: "image/png" },
  },
  viewport:
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <StoreUserInfo />
          <LanguageProvider>
            <PomodoroProvider>
              <Box
                sx={{
                  minHeight: "100vh",
                  bgcolor: "#f1f5f9",
                  pb: 4,
                  overflowX: "hidden",
                }}
              >
                <NavigationBar />
                {children}
              </Box>
              <Analytics />
            </PomodoroProvider>
          </LanguageProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
