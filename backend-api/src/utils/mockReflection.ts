import { ReflectionPattern, ReflectionResult } from "../types/reflection";

const PASSIVE_CONSUMPTION_TERMS = ["doomscroll", "shorts", "reels"];

const AUTOPILOT_TEMPLATE: Omit<ReflectionResult, "primaryPattern" | "dopamineDrain"> = {
  verdict: "AUTOPILOT",
  intensity: 4,
  mirrorLine: "This thought feels more reactive than reflective right now.",
  reframePrompt: "Pause and name what you actually need."
};

const AUTHENTIC_REFLECTION: ReflectionResult = {
  verdict: "AUTHENTIC",
  primaryPattern: "grounded",
  intensity: 2,
  mirrorLine: "This thought sounds grounded and more intentional.",
  reframePrompt: "Take the next step slowly and clearly.",
  dopamineDrain: false
};

const includesAny = (thought: string, keywords: string[]) =>
  keywords.some((keyword) => thought.includes(keyword));

const createAutopilotReflection = (
  primaryPattern: ReflectionPattern,
  dopamineDrain: boolean
): ReflectionResult => ({
  ...AUTOPILOT_TEMPLATE,
  primaryPattern,
  dopamineDrain
});

export const createMockReflection = (normalizedThought: string): ReflectionResult => {
  if (includesAny(normalizedThought, PASSIVE_CONSUMPTION_TERMS)) {
    return createAutopilotReflection("fear", true);
  }

  if (normalizedThought.includes("validation")) {
    return createAutopilotReflection("approval_seeking", false);
  }

  if (normalizedThought.includes("prove")) {
    return createAutopilotReflection("ego", false);
  }

  if (includesAny(normalizedThought, ["hate", "angry"])) {
    return createAutopilotReflection("venting", false);
  }

  if (normalizedThought.includes("jealous")) {
    return createAutopilotReflection("fear", false);
  }

  return AUTHENTIC_REFLECTION;
};
