/**
 * Text-to-Speech utility functions for accessibility
 */

/**
 * Checks if the Web Speech API is supported in the current browser
 * @returns {boolean} - Whether speech synthesis is supported
 */
export const isSpeechSupported = () => {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
};

/**
 * Speaks the provided text in the specified language
 * @param {string} text - The text to speak
 * @param {string} langCode - The language code (e.g., 'en', 'fr', 'es')
 * @param {Function} onStart - Callback when speech starts
 * @param {Function} onEnd - Callback when speech ends
 * @param {Function} onError - Callback when speech fails
 * @returns {boolean} - Whether the speech was initiated successfully
 */
export const speakText = (
  text,
  langCode = "en",
  onStart = () => {},
  onEnd = () => {},
  onError = () => {}
) => {
  if (!isSpeechSupported()) {
    console.error("Speech synthesis not supported in this browser");
    onError("Speech synthesis not supported in this browser");
    return false;
  }

  // Cancel any ongoing speech
  stopSpeech();

  try {
    const utterance = new SpeechSynthesisUtterance(text);

    // Map our language codes to the appropriate BCP 47 language tags
    const langMap = {
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      it: "it-IT",
      pt: "pt-BR",
      nl: "nl-NL",
      pl: "pl-PL",
      ru: "ru-RU",
      zh: "zh-CN",
      ja: "ja-JP",
      ko: "ko-KR",
      ar: "ar-SA",
      hi: "hi-IN",
      tr: "tr-TR",
    };

    utterance.lang = langMap[langCode] || "en-US";

    // Set event handlers
    utterance.onstart = onStart;
    utterance.onend = onEnd;
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      onError(event);
    };

    // Speak the text
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (error) {
    console.error("Error using text-to-speech:", error);
    onError(error);
    return false;
  }
};

/**
 * Stops any ongoing speech
 */
export const stopSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Gets a list of available voices for the current browser
 * @param {string} langCode - Optional language code filter
 * @returns {Array} - List of available voices
 */
export const getAvailableVoices = (langCode) => {
  if (!isSpeechSupported()) {
    return [];
  }

  const voices = window.speechSynthesis.getVoices();

  if (langCode) {
    // Filter voices by language if a language code is provided
    return voices.filter((voice) => voice.lang.startsWith(langCode));
  }

  return voices;
};
