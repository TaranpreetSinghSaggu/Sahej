export type ReflectionVerdict = "AUTOPILOT" | "AUTHENTIC";

export type ReflectionPattern =
  | "ego"
  | "venting"
  | "approval_seeking"
  | "fear"
  | "intentional"
  | "grounded";

export type ReflectionIntensity = 1 | 2 | 3 | 4 | 5;

export interface ReflectRequestBody {
  thought?: unknown;
}

export interface EmotionProfile {
  primaryEmotion: string;
  secondaryEmotion: string;
  underlyingNeed: string;
  bodyColor: string;
  colorName: string;
  explanation: string;
}

export interface JournalEntry {
  summary: string;
  awarenessPrompt: string;
}

export interface ReflectionResult {
  verdict: ReflectionVerdict;
  primaryPattern: ReflectionPattern;
  intensity: ReflectionIntensity;
  mirrorLine: string;
  reframePrompt: string;
  dopamineDrain: boolean;
  emotionProfile: EmotionProfile;
  journalEntry: JournalEntry;
}
