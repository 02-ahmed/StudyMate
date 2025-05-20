import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../utils/translations";

/**
 * Custom hook for translations
 * @returns {Object} - Translation functions
 */
export default function useTranslation() {
  const { language } = useLanguage();

  /**
   * Get translation for a key
   * @param {string} key - Translation key
   * @param {Object|string} placeholdersOrDefault - Placeholders for the translation or default value
   * @param {string} defaultValue - Default value if translation is not found
   * @returns {string} - Translated text
   */
  const t = (key, placeholdersOrDefault, defaultValue) => {
    // Check if the second parameter is an object (placeholders) or a string (default value)
    let result;
    if (
      typeof placeholdersOrDefault === "object" &&
      placeholdersOrDefault !== null
    ) {
      result = getTranslation(
        key,
        language,
        defaultValue,
        placeholdersOrDefault
      );
    } else {
      // If second parameter is not an object, it's the default value
      result = getTranslation(key, language, placeholdersOrDefault);
    }

    // Ensure we always return a string
    if (typeof result !== "string") {
      console.warn(`Translation for key "${key}" is not a string:`, result);
      return (
        placeholdersOrDefault?.toString() || defaultValue?.toString() || key
      );
    }

    return result;
  };

  return { t };
}
