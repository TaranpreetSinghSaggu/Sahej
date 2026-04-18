export type Verdict = "AUTOPILOT" | "AUTHENTIC";

export type PrimaryPattern =
  | "ego"
  | "venting"
  | "approval_seeking"
  | "fear"
  | "intentional"
  | "grounded";

export type Intensity = 1 | 2 | 3 | 4 | 5;

export interface ReflectRequestBody {
  thought?: unknown;
}

export interface ReflectionResponse {
  verdict: Verdict;
  primaryPattern: PrimaryPattern;
  intensity: Intensity;
  mirrorLine: string;
  reframePrompt: string;
  dopamineDrain: boolean;
}
