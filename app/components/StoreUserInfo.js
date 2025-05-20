"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function StoreUserInfo() {
  const { user, isLoaded } = useUser();

  // Store user ID in localStorage for API logging
  useEffect(() => {
    if (isLoaded && user) {
      try {
        localStorage.setItem("userId", user.id);
        console.log("User ID stored in localStorage for API logging:", user.id);

        // Add to window for components to access
        window.clerkUserInfo = { id: user.id };
      } catch (error) {
        console.error("Error storing user ID:", error);
      }
    }
  }, [isLoaded, user]);

  return null;
}
