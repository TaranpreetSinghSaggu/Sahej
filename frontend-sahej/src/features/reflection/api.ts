import { getApiBaseUrlConfig } from "../../lib/env";
import {
  ReflectionIntensity,
  ReflectionPattern,
  ReflectionResult,
  ReflectionVerdict
} from "./types";

const verdicts: ReflectionVerdict[] = ["AUTOPILOT", "AUTHENTIC"];
const patterns: ReflectionPattern[] = [
  "ego",
  "venting",
  "approval_seeking",
  "fear",
  "intentional",
  "grounded"
];
const intensities: ReflectionIntensity[] = [1, 2, 3, 4, 5];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReflectionResult(value: unknown): value is ReflectionResult {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.verdict === "string" &&
    verdicts.includes(value.verdict as ReflectionVerdict) &&
    typeof value.primaryPattern === "string" &&
    patterns.includes(value.primaryPattern as ReflectionPattern) &&
    typeof value.intensity === "number" &&
    intensities.includes(value.intensity as ReflectionIntensity) &&
    typeof value.mirrorLine === "string" &&
    typeof value.reframePrompt === "string" &&
    typeof value.dopamineDrain === "boolean"
  );
}

function getApiErrorMessage(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }

  return typeof payload.error === "string" ? payload.error : null;
}

export async function reflectThought(thought: string): Promise<ReflectionResult> {
  const trimmedThought = thought.trim();

  if (!trimmedThought) {
    throw new Error("Thought is required before reflection can begin.");
  }

  const { apiBaseUrl, error } = getApiBaseUrlConfig();

  if (!apiBaseUrl || error) {
    throw new Error(error ?? "Missing EXPO_PUBLIC_API_BASE_URL.");
  }

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/reflect`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ thought: trimmedThought })
    });
  } catch {
    throw new Error(
      "Could not reach the reflection service. Check that the backend is running and reachable from this device."
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new Error("The reflection service returned unreadable JSON.");
  }

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(payload) ?? `Reflection request failed with status ${response.status}.`
    );
  }

  if (!isReflectionResult(payload)) {
    throw new Error("The reflection service returned an unexpected response shape.");
  }

  return payload;
}
