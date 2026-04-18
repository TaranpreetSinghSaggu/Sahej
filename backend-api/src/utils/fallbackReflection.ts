import { ReflectionResult } from "../types/reflection";

const FALLBACK_REFLECTION: ReflectionResult = {
  verdict: "AUTHENTIC",
  primaryPattern: "grounded",
  intensity: 1,
  mirrorLine: "Pause for a breath and notice what is really here.",
  reframePrompt: "Choose your next step with calm clarity.",
  dopamineDrain: false
};

export const fallbackReflection = (): ReflectionResult => FALLBACK_REFLECTION;
