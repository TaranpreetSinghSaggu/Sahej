import { ReflectionResult } from "./types";

export const fallbackReflectionResult: ReflectionResult = {
  verdict: "AUTHENTIC",
  primaryPattern: "grounded",
  intensity: 2,
  mirrorLine:
    "The live mirror is unavailable right now, so this is a safe fallback reflection for the demo.",
  reframePrompt:
    "Take one steady breath, then try again when the reflection service is reachable.",
  dopamineDrain: false
};
