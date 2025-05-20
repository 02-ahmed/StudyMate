// Import all language translations
import en from "./en";
import fr from "./fr";
import es from "./es";
import de from "./de";

// Combine all translations
export const translations = {
  en,
  fr,
  es,
  de,
};

// Helper function to replace placeholders in a string
const replacePlaceholders = (str, placeholders) => {
  let result = str;
  for (const key in placeholders) {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(regex, placeholders[key]);
  }
  return result;
};

// Helper function to get translation
export const getTranslation = (
  key,
  language = "en",
  defaultValue,
  placeholders
) => {
  // If the language doesn't exist, fall back to English
  if (!translations[language]) {
    console.warn(`Language '${language}' not found, falling back to English`);
    language = "en";
  }

  // Split the key by dots to handle nested properties
  const keys = key.split(".");
  let result = translations[language];

  // Navigate through the nested object
  for (const k of keys) {
    if (result && result[k] !== undefined) {
      result = result[k];
    } else {
      // If not found in the specified language, try English as fallback
      if (language !== "en") {
        let enResult = translations.en;
        let found = true;

        // Try to find the key in English
        for (const enK of keys) {
          if (enResult && enResult[enK] !== undefined) {
            enResult = enResult[enK];
          } else {
            found = false;
            break;
          }
        }

        if (found) {
          // If the result is an object, return a string representation or the default value
          if (typeof enResult === "object" && enResult !== null) {
            console.warn(
              `Translation key '${key}' in English points to an object, not a string`
            );
            return defaultValue !== undefined ? defaultValue : key;
          }

          // If placeholders are provided, replace them in the result
          if (placeholders && typeof enResult === "string") {
            return replacePlaceholders(enResult, placeholders);
          }
          return enResult;
        }
      }

      console.warn(
        `Translation key '${key}' not found in language '${language}'`
      );
      return defaultValue !== undefined ? defaultValue : key; // Return default value or the key itself if not found
    }
  }

  // If the result is an object, return a string representation or the default value
  if (typeof result === "object" && result !== null) {
    console.warn(`Translation key '${key}' points to an object, not a string`);
    return defaultValue !== undefined ? defaultValue : key;
  }

  // If placeholders are provided, replace them in the result
  if (placeholders && typeof result === "string") {
    return replacePlaceholders(result, placeholders);
  }

  return result;
};

export default translations;
