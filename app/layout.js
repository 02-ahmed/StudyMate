import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Box } from "@mui/material";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

// Import NavigationBar as a Client Component
const NavigationBar = dynamic(() => import("./components/NavigationBar"), {
  ssr: true,
});

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
