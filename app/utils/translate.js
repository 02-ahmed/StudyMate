import translations from "./translations";

// Import useLanguage but with try-catch to handle case where context isn't available
let useLanguageHook = () => ({ language: "en" }); // Fallback
try {
  const { useLanguage } = require("../contexts/LanguageContext.js");
  useLanguageHook = useLanguage;
  // console.log("Successfully imported useLanguage from LanguageContext");
} catch (error) {
  console.error("Failed to import useLanguage, using fallback:", error);
}

// Debug logging
// console.log("=== TRANSLATE MODULE (APP) LOADED ===");
// console.log("Translate app module path: %s", import.meta.url);

/**
 * Get translated text for a given key and language
 * @param {string} key - Dot notation path to the translation (e.g., 'buttons.save')
 * @param {string} language - Language code (e.g., 'en', 'es', 'fr')
 * @param {string|object} defaultTextOrVariables - Default text if translation not found, or variables for placeholder replacement
 * @param {object} [variables] - Variables for placeholder replacement (when defaultText is provided separately)
 * @returns {string} - Translated text or the key/default if translation not found
 */
export function t(key, language = "en", defaultTextOrVariables, variables) {
  // Handle the case when defaultTextOrVariables is actually variables
  let defaultText =
    typeof defaultTextOrVariables === "string"
      ? defaultTextOrVariables
      : undefined;
  const vars =
    typeof defaultTextOrVariables === "object"
      ? defaultTextOrVariables
      : variables;

  // Default to English if language not supported
  if (!translations[language]) {
    // Reduced logging
    language = "en";
  }

  // Split the key by dots to access nested properties
  const keys = key.split(".");
  let result = translations[language];

  // Navigate through the nested object
  for (const k of keys) {
    if (result && result[k] !== undefined) {
      result = result[k];
    } else {
      // Translation not found, try English as fallback
      if (language !== "en") {
        const fallback = getEnglishFallback(key);
        return processPlaceholders(
          fallback !== null ? fallback : defaultText || key,
          vars
        );
      }
      return processPlaceholders(defaultText || key, vars); // Return default text or key if not found in English either
    }
  }

  return processPlaceholders(result, vars);
}

/**
 * Replace placeholders in a string with provided variables
 * @param {string} text - Text containing placeholders {variable}
 * @param {object} variables - Object with key-value pairs for replacement
 * @returns {string} - Text with replaced placeholders
 */
function processPlaceholders(text, variables) {
  if (!variables || typeof text !== "string") return text;

  return text.replace(/{([^{}]*)}/g, (match, key) => {
    const value = variables[key];
    return value !== undefined ? value : match;
  });
}

/**
 * Get English fallback for missing translations
 * @param {string} key - Translation key
 * @returns {string|null} - English translation or null if not found
 */
function getEnglishFallback(key) {
  const keys = key.split(".");
  let result = translations.en;

  for (const k of keys) {
    if (result && result[k] !== undefined) {
      result = result[k];
    } else {
      return null;
    }
  }

  return result;
}

/**
 * Custom hook that integrates with your existing language context
 * Has a fallback for when the context is not available
 */
export function useTranslation() {
  let language = "en";
  let contextAvailable = false;

  try {
    // Try to use the language context
    const context = useLanguageHook();
    // Remove excessive logging
    if (context && context.language) {
      language = context.language;
      contextAvailable = true;
    }
  } catch (error) {
    console.error(
      "🔍 APP TRANSLATE: Error in useTranslation, using fallback:",
      error
    );
  }

  // Add debug log for translations but only in development and not for every call
  const translationFunction = (key, defaultTextOrVariables, variables) => {
    const translatedText = t(key, language, defaultTextOrVariables, variables);
    // Disable logging to improve performance
    // console.log(`🔍 APP TRANSLATE: Translating key '${key}' to '${translatedText}' (language: ${language})`);
    return translatedText;
  };

  return {
    t: translationFunction,
    language,
    contextAvailable,
  };
}
