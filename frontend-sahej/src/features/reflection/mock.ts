import { EmotionProfile, JournalEntry, ReflectionResult } from "./types";

export const fallbackEmotionProfile: EmotionProfile = {
  primaryEmotion: "settling",
  secondaryEmotion: "openness",
  underlyingNeed: "safety",
  bodyColor: "#5B6CFF",
  colorName: "steady indigo",
  explanation:
    "This fallback reflection invites your system toward steadiness first, because clarity grows more easily from safety than urgency."
};

export const fallbackJournalEntry: JournalEntry = {
  summary: "I am being invited back to steadiness before deciding what this moment means.",
  awarenessPrompt: "What changes when I give myself one slower breath?"
};

export const fallbackReflectionResult: ReflectionResult = {
  verdict: "AUTHENTIC",
  primaryPattern: "grounded",
  intensity: 2,
  mirrorLine:
    "The live mirror is unavailable right now, so this is a safe fallback reflection for the demo.",
  reframePrompt:
    "Take one steady breath, then try again when the reflection service is reachable.",
  dopamineDrain: false,
  emotionProfile: fallbackEmotionProfile,
  journalEntry: fallbackJournalEntry
};
