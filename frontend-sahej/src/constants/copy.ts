export const copy = {
  home: {
    title: "Sahej",
    subtitle: "Pause before you proceed.",
    placeholder: "What are you about to say, send, or do?",
    primaryAction: "Reflect",
    validation: "Please enter a thought before continuing.",
    footer: "A calm check-in before action."
  },
  reflect: {
    eyebrow: "Step 2",
    title: "Hold for a breath.",
    subtitle: "Stillness helps the mirror see more clearly.",
    countdownLabel: "Breathe...",
    listeningLabel: "Listening...",
    unsupportedSensors: "Stillness sensing is unavailable on this device. The pause will continue without it.",
    missingThoughtTitle: "Nothing to reflect yet.",
    missingThoughtBody: "Return home, enter a thought, and begin again.",
    missingThoughtAction: "Back to home"
  },
  result: {
    eyebrow: "Step 3",
    title: "Your mirror",
    subtitle: "A reflection after the pause.",
    fallbackTitle: "Connection softened",
    missingTitle: "No reflection available yet.",
    missingBody: "Return home and begin a fresh reflection to see your mirror.",
    primaryAction: "Back to home"
  },
  shared: {
    capturedThought: "Captured thought"
  }
} as const;
