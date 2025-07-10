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

let soundTimeouts = [];

// Function to clear any ongoing sound sequence
export const stopNotificationSound = () => {
  soundTimeouts.forEach(clearTimeout);
  soundTimeouts = [];
};

// Play a notification sound
export const playNotificationSound = (type = "default") => {
  try {
    const context = initAudioContext();
    if (!context) return;

    // Stop any previously playing sound sequence before starting a new one
    stopNotificationSound();

    const playNote = (freq, duration, delay, volume = 0.4) => {
      const timeoutId = setTimeout(() => {
        generateBeep(context, freq, duration, volume);
      }, delay);
      soundTimeouts.push(timeoutId);
    };

    switch (type) {
      case "work": // Work session ends -> calm, rewarding sound
        playNote(523, 0.2, 0); // C5
        playNote(659, 0.2, 300); // E5
        playNote(784, 0.2, 600); // G5
        playNote(1046, 0.4, 900); // C6
        playNote(784, 0.2, 1700); // G5
        playNote(880, 0.2, 2000); // A5
        playNote(1046, 0.5, 2300); // C6
        playNote(659, 0.2, 3100); // E5
        playNote(523, 0.6, 3400); // C5
        break;
      case "break": // Break ends -> brighter, more alert sound
        playNote(784, 0.15, 0); // G5
        playNote(784, 0.15, 200); // G5
        playNote(1046, 0.3, 400); // C6
        playNote(784, 0.15, 900); // G5
        playNote(1046, 0.15, 1100); // C6
        playNote(1175, 0.3, 1300); // D6
        playNote(1046, 0.15, 1800); // C6
        playNote(1175, 0.15, 2000); // D6
        playNote(1318, 0.5, 2200); // E6
        playNote(1175, 0.1, 2900);
        playNote(1318, 0.1, 3050);
        playNote(1568, 0.4, 3200); // G6
        break;
      default:
        // Default notification sound
        playNote(660, 0.2, 0);
    }
  } catch (error) {
    console.error("Error playing notification sound:", error);
  }
};
