"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../utils/firebase.js";

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
};

// Add some debug logging
// console.log("=== LANGUAGE CONTEXT MODULE (APP) LOADED ===");
// console.log("Module path: %s", import.meta.url);
// console.log("Supported languages:", Object.keys(SUPPORTED_LANGUAGES));
// console.log(
//   "Supported language display names:",
//   Object.values(SUPPORTED_LANGUAGES)
// );

// Create context with default values
const LanguageContext = createContext({
  language: "en",
  changeLanguage: () => {},
  supportedLanguages: SUPPORTED_LANGUAGES,
});

// Create provider
export function LanguageProvider({ children }) {
  // Default to English or try to get from Firestore
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded } = useUser();

  // Load user's language preference from Firebase
  useEffect(() => {
    async function loadLanguagePreference() {
      if (!isLoaded || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get user preferences document
        const prefsRef = doc(db, "users", user.id, "preferences", "language");
        const prefsDoc = await getDoc(prefsRef);

        if (prefsDoc.exists()) {
          // Use stored preference
          const storedLanguage = prefsDoc.data().value;

          if (SUPPORTED_LANGUAGES[storedLanguage]) {
            setLanguage(storedLanguage);
          } else {
          }
        } else {
        }
      } catch (error) {
        console.error("Error loading language preference:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadLanguagePreference();
  }, [user, isLoaded]);

  // Update language and save to Firestore
  const changeLanguage = async (newLanguage) => {
    try {
      // Validate the language is supported
      if (!(newLanguage in SUPPORTED_LANGUAGES)) {
        console.error(
          `📣 LanguageContext: Language '${newLanguage}' not supported. Supported languages:`,
          Object.keys(SUPPORTED_LANGUAGES)
        );
        return;
      }

      // Update state immediately for responsive UI
      setLanguage(newLanguage);

      // Save to Firebase if user is logged in
      if (user) {
        try {
          const prefsRef = doc(db, "users", user.id, "preferences", "language");
          await setDoc(prefsRef, { value: newLanguage }, { merge: true });
        } catch (error) {
          console.error("Error saving language preference to database:", error);
        }
      } else {
        // console.log("User not logged in, not saving preference to Firebase");
      }
    } catch (error) {
      console.error(
        "📣 LanguageContext: Error saving language preference:",
        error
      );
    }
  };

  // Create the context value with supportedLanguages and loading state
  const contextValue = {
    language,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  // Removed excessive logging
  const context = useContext(LanguageContext);
  // Since we've provided default values in createContext(),
  // this check is less likely to fail
  if (!context) {
    console.error(
      "🔍 APP CONTEXT: useLanguage: Context is undefined, this should not happen with default values"
    );
  }
  return context;
}
