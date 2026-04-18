import { ReflectionPattern } from "./reflection";

export type ConsequenceAction = "pause" | "wait" | "rewrite";

export interface ConsequencePreviewRequestBody {
  thought?: unknown;
  primaryPattern?: unknown;
}

export interface ConsequencePreviewResult {
  autopilotOutcome: string;
  alignedOutcome: string;
  suggestedAction: ConsequenceAction;
}

export const REFLECTION_PATTERNS: readonly ReflectionPattern[] = [
  "ego",
  "venting",
  "approval_seeking",
  "fear",
  "intentional",
  "grounded"
];
