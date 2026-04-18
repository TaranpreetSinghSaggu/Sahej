import { ReflectionPattern } from "./reflection";

export interface WeeklyMirrorMetrics {
  totalReflections: number;
  autopilotCount: number;
  authenticCount: number;
  dopamineDrainCount: number;
  autopilotRate: number;
}

export interface WeeklyMirrorResult {
  dominantPattern: ReflectionPattern | "none";
  strongestAuthenticPattern: ReflectionPattern | "none";
  summary: string;
  recoveryMetrics: WeeklyMirrorMetrics;
}
