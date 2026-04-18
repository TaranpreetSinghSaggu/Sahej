import { ReflectionResult } from "./types";

export interface ShiftTechniquePack {
  title: string;
  subtitle: string;
  techniques: string[];
}

const NEGATIVE_EMOTION_HINTS = [
  "anger",
  "anxiety",
  "fear",
  "hurt",
  "insecurity",
  "grief",
  "loneliness",
  "envy",
  "frustration",
  "defensiveness",
  "numbness",
  "shame"
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function isNegativeProfile(result: ReflectionResult) {
  if (result.verdict === "AUTOPILOT") {
    return true;
  }

  const primary = normalize(result.emotionProfile.primaryEmotion);
  const secondary = normalize(result.emotionProfile.secondaryEmotion);

  return NEGATIVE_EMOTION_HINTS.some((hint) => primary.includes(hint) || secondary.includes(hint));
}

export function getShiftTechniques(result: ReflectionResult): ShiftTechniquePack {
  if (!isNegativeProfile(result)) {
    return {
      title: "Stability techniques",
      subtitle: "Keep this regulated state alive.",
      techniques: [
        "Take one slower exhale than inhale for 60 seconds.",
        "Write one sentence naming your next intentional action.",
        "Protect this state by delaying low-value scrolling for 10 minutes."
      ]
    };
  }

  if (result.primaryPattern === "venting" || normalize(result.emotionProfile.primaryEmotion).includes("anger")) {
    return {
      title: "Shift from heat to clarity",
      subtitle: "Move from reaction to response in under two minutes.",
      techniques: [
        "Drop your shoulders and unclench your jaw before typing anything.",
        "Use a 90-second pause: no sending, no replying, only breathing out slowly.",
        "Rewrite your message as a boundary sentence, not an attack sentence."
      ]
    };
  }

  if (result.primaryPattern === "fear" || normalize(result.emotionProfile.primaryEmotion).includes("anxiety")) {
    return {
      title: "Shift from fear to steadiness",
      subtitle: "Help your body feel safe first, then decide.",
      techniques: [
        "Try 4-6 breathing for five rounds (inhale 4, exhale 6).",
        "Name 3 things you can control in this exact moment.",
        "Take one tiny action now, not the whole plan."
      ]
    };
  }

  if (result.primaryPattern === "approval_seeking") {
    return {
      title: "Shift from approval to self-trust",
      subtitle: "Anchor worth internally before asking externally.",
      techniques: [
        "Say out loud: I am still enough before feedback arrives.",
        "Delay checking reactions for 10 minutes and do one grounding task.",
        "Ask: what value am I living even if nobody validates it?"
      ]
    };
  }

  return {
    title: "Shift toward a grounded state",
    subtitle: "Small body-first resets can change emotional direction fast.",
    techniques: [
      "Place one hand on chest and one on belly for three slow breaths.",
      "Drink water and step away from the screen for 60 seconds.",
      "Choose one sentence that is both true and kind."
    ]
  };
}
