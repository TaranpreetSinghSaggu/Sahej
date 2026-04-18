import { getApiBaseUrlConfig } from "../../lib/env";
import {
  EmotionProfile,
  JournalEntry,
  ReflectionIntensity,
  ReflectionPattern,
  ReflectionResult,
  ReflectionVerdict
} from "./types";
import { fallbackEmotionProfile, fallbackJournalEntry } from "./mock";

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

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeHexColor(value: unknown, fallbackColor: string) {
  if (typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)) {
    return value.toUpperCase();
  }

  return fallbackColor;
}

function normalizeEmotionProfile(value: unknown): EmotionProfile {
  if (!isRecord(value)) {
    return fallbackEmotionProfile;
  }

  return {
    primaryEmotion: hasText(value.primaryEmotion)
      ? value.primaryEmotion.trim()
      : fallbackEmotionProfile.primaryEmotion,
    secondaryEmotion: hasText(value.secondaryEmotion)
      ? value.secondaryEmotion.trim()
      : fallbackEmotionProfile.secondaryEmotion,
    underlyingNeed: hasText(value.underlyingNeed)
      ? value.underlyingNeed.trim()
      : fallbackEmotionProfile.underlyingNeed,
    bodyColor: normalizeHexColor(value.bodyColor, fallbackEmotionProfile.bodyColor),
    colorName: hasText(value.colorName) ? value.colorName.trim() : fallbackEmotionProfile.colorName,
    explanation: hasText(value.explanation)
      ? value.explanation.trim()
      : fallbackEmotionProfile.explanation
  };
}

function normalizeJournalEntry(value: unknown): JournalEntry {
  if (!isRecord(value)) {
    return fallbackJournalEntry;
  }

  return {
    summary: hasText(value.summary) ? value.summary.trim() : fallbackJournalEntry.summary,
    awarenessPrompt: hasText(value.awarenessPrompt)
      ? value.awarenessPrompt.trim()
      : fallbackJournalEntry.awarenessPrompt
  };
}

function normalizeReflectionResult(value: unknown): ReflectionResult {
  if (!isRecord(value)) {
    throw new Error("The reflection service returned an unexpected response shape.");
  }

  if (
    typeof value.verdict !== "string" ||
    !verdicts.includes(value.verdict as ReflectionVerdict) ||
    typeof value.primaryPattern !== "string" ||
    !patterns.includes(value.primaryPattern as ReflectionPattern) ||
    typeof value.intensity !== "number" ||
    !intensities.includes(value.intensity as ReflectionIntensity) ||
    !hasText(value.mirrorLine) ||
    !hasText(value.reframePrompt) ||
    typeof value.dopamineDrain !== "boolean"
  ) {
    throw new Error("The reflection service returned an unexpected response shape.");
  }

  return {
    verdict: value.verdict as ReflectionVerdict,
    primaryPattern: value.primaryPattern as ReflectionPattern,
    intensity: value.intensity as ReflectionIntensity,
    mirrorLine: value.mirrorLine.trim(),
    reframePrompt: value.reframePrompt.trim(),
    dopamineDrain: value.dopamineDrain,
    emotionProfile: normalizeEmotionProfile(value.emotionProfile),
    journalEntry: normalizeJournalEntry(value.journalEntry)
  };
}

function getApiErrorMessage(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }

  return typeof payload.error === "string" ? payload.error : null;
}

export async function reflectThought(
  thought: string,
  signal?: AbortSignal
): Promise<ReflectionResult> {
  const trimmedThought = thought.trim();

  if (!trimmedThought) {
    throw new Error("Thought is required before reflection can begin.");
  }

  const { apiBaseUrl, error } = getApiBaseUrlConfig();

  if (!apiBaseUrl || error) {
    throw new Error(error ?? "Missing EXPO_PUBLIC_API_BASE_URL.");
  }

  let response: Response;
  const endpoint = `${apiBaseUrl}/reflect`;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ thought: trimmedThought }),
      signal
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The reflection request was aborted before completion.");
    }

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

  return normalizeReflectionResult(payload);
}
