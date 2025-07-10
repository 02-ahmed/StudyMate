// Audio utility for playing notification sounds

// Create an audio context lazily to comply with browser autoplay policies
let audioContext = null;

// Initialize audio context on user interaction
const initAudioContext = () => {
  if (
    !audioContext &&
    typeof window !== "undefined" &&
    "AudioContext" in window
  ) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

// Generate a beep sound
const generateBeep = (
  context,
  frequency = 440,
  duration = 0.3,
  volume = 0.5
) => {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gainNode.gain.value = volume;
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    context.currentTime + duration
  );

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + duration);
};

// Play a notification sound
export const playNotificationSound = (type = "default") => {
  try {
    const context = initAudioContext();
    if (!context) return;

    switch (type) {
      case "work":
        // Higher pitched double beep for work session completion
        generateBeep(context, 880, 0.2);
        setTimeout(() => generateBeep(context, 880, 0.2), 250);
        break;
      case "break":
        // Lower pitched single beep for break completion
        generateBeep(context, 440, 0.3);
        break;
      default:
        // Default notification sound
        generateBeep(context, 660, 0.2);
    }
  } catch (error) {
    console.error("Error playing notification sound:", error);
  }
};
