import { ReflectionResult } from "../features/reflection/types";

export interface LatestReflectionState {
  thought: string;
  result: ReflectionResult;
  isFallback: boolean;
  errorMessage?: string;
}

// Intentional hackathon simplification: store only the latest reflection in memory.
let latestReflection: LatestReflectionState | null = null;

export function setLatestReflection(value: LatestReflectionState) {
  latestReflection = value;
}

export function getLatestReflection() {
  return latestReflection;
}

export function clearLatestReflection() {
  latestReflection = null;
}
