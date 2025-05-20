import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Box } from "@mui/material";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Analytics } from "@vercel/analytics/react";
import { LanguageProvider } from "./contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

// Import NavigationBar as a Client Component
const NavigationBar = dynamic(() => import("./components/NavigationBar"), {
  ssr: true,
});

// Import StoreUserInfo as a client component
const StoreUserInfo = dynamic(() => import("./components/StoreUserInfo"), {
  ssr: false,
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <StoreUserInfo />
          <LanguageProvider>
            <Box
              sx={{
                minHeight: "100vh",
                bgcolor: "#f1f5f9",
                pb: 4,
              }}
            >
              <NavigationBar />
              {children}
            </Box>
            <Analytics />
          </LanguageProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
