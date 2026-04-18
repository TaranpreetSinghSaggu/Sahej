import {
  ReflectionIntensity,
  ReflectionPattern,
  ReflectionVerdict
} from "./reflection";

export interface SessionReflectionEvent {
  timestamp: string;
  thought: string;
  verdict: ReflectionVerdict;
  primaryPattern: ReflectionPattern;
  intensity: ReflectionIntensity;
  dopamineDrain: boolean;
}
