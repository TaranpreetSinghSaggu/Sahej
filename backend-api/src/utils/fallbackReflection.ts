import { ReflectionResult } from "../types/reflection";

const FALLBACK_REFLECTION: ReflectionResult = {
  verdict: "AUTHENTIC",
  primaryPattern: "grounded",
  intensity: 1,
  mirrorLine: "Pause for a breath and notice what is really here.",
  reframePrompt: "Choose your next step with calm clarity.",
  dopamineDrain: false,
  emotionProfile: {
    primaryEmotion: "settling",
    secondaryEmotion: "openness",
    underlyingNeed: "safety",
    bodyColor: "#5B6CFF",
    colorName: "steady indigo",
    explanation:
      "This fallback reflection invites your system toward steadiness first, because clarity grows more easily from safety than urgency."
  },
  journalEntry: {
    summary: "I am being invited back to steadiness before deciding what this moment means.",
    awarenessPrompt: "What changes when I give myself one slower breath?"
  }
};

export const fallbackReflection = (): ReflectionResult => FALLBACK_REFLECTION;
