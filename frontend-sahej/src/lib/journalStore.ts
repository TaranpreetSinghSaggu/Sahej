import AsyncStorage from "@react-native-async-storage/async-storage";

import { ReflectionResult } from "../features/reflection/types";
import { fallbackReflectionResult } from "../features/reflection/mock";

export const JOURNAL_STORAGE_KEY = "sahej-ai-journal";

export interface JournalRecord extends ReflectionResult {
  id: string;
  timestamp: string;
  originalThought: string;
  source: "reflection" | "emotion_log";
}

function generateJournalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPattern(value: unknown): value is ReflectionResult["primaryPattern"] {
  return (
    value === "ego" ||
    value === "venting" ||
    value === "approval_seeking" ||
    value === "fear" ||
    value === "intentional" ||
    value === "grounded"
  );
}

function isIntensity(value: unknown): value is ReflectionResult["intensity"] {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

function normalizeJournalRecord(value: unknown): JournalRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  const fallback = fallbackReflectionResult;
  const id = hasText(value.id) ? value.id : generateJournalId();
  const timestamp = hasText(value.timestamp) ? value.timestamp : new Date().toISOString();
  const originalThought = hasText(value.originalThought)
    ? value.originalThought
    : "Untitled reflection";

  return {
    id,
    timestamp,
    originalThought,
    source: value.source === "emotion_log" ? "emotion_log" : "reflection",
    verdict: value.verdict === "AUTOPILOT" || value.verdict === "AUTHENTIC"
      ? value.verdict
      : fallback.verdict,
    primaryPattern: isPattern(value.primaryPattern)
      ? value.primaryPattern
      : fallback.primaryPattern,
    intensity: isIntensity(value.intensity) ? value.intensity : fallback.intensity,
    mirrorLine: hasText(value.mirrorLine) ? value.mirrorLine : fallback.mirrorLine,
    reframePrompt: hasText(value.reframePrompt) ? value.reframePrompt : fallback.reframePrompt,
    dopamineDrain: typeof value.dopamineDrain === "boolean" ? value.dopamineDrain : false,
    emotionProfile: isRecord(value.emotionProfile)
      ? {
          primaryEmotion: hasText(value.emotionProfile.primaryEmotion)
            ? value.emotionProfile.primaryEmotion
            : fallback.emotionProfile.primaryEmotion,
          secondaryEmotion: hasText(value.emotionProfile.secondaryEmotion)
            ? value.emotionProfile.secondaryEmotion
            : fallback.emotionProfile.secondaryEmotion,
          underlyingNeed: hasText(value.emotionProfile.underlyingNeed)
            ? value.emotionProfile.underlyingNeed
            : fallback.emotionProfile.underlyingNeed,
          bodyColor: hasText(value.emotionProfile.bodyColor)
            ? value.emotionProfile.bodyColor
            : fallback.emotionProfile.bodyColor,
          colorName: hasText(value.emotionProfile.colorName)
            ? value.emotionProfile.colorName
            : fallback.emotionProfile.colorName,
          explanation: hasText(value.emotionProfile.explanation)
            ? value.emotionProfile.explanation
            : fallback.emotionProfile.explanation
        }
      : fallback.emotionProfile,
    journalEntry: isRecord(value.journalEntry)
      ? {
          summary: hasText(value.journalEntry.summary)
            ? value.journalEntry.summary
            : fallback.journalEntry.summary,
          awarenessPrompt: hasText(value.journalEntry.awarenessPrompt)
            ? value.journalEntry.awarenessPrompt
            : fallback.journalEntry.awarenessPrompt
        }
      : fallback.journalEntry
  };
}

function parseJournalEntries(value: string | null): JournalRecord[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => normalizeJournalRecord(item))
      .filter((item): item is JournalRecord => item !== null);
  } catch {
    return [];
  }
}

async function writeJournalEntries(entries: JournalRecord[]) {
  const sortedEntries = [...entries].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(sortedEntries));
}

export async function getJournalEntries(): Promise<JournalRecord[]> {
  try {
    const storedValue = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);
    return parseJournalEntries(storedValue).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch {
    return [];
  }
}

export async function listJournalEntries(limit = 20): Promise<JournalRecord[]> {
  const entries = await getJournalEntries();
  return entries.slice(0, limit);
}

export async function getJournalEntryById(id: string): Promise<JournalRecord | null> {
  const entries = await getJournalEntries();
  return entries.find((entry) => entry.id === id) ?? null;
}

export async function appendJournalEntry(
  entry: Omit<JournalRecord, "id" | "timestamp" | "source"> &
    Partial<Pick<JournalRecord, "id" | "timestamp" | "source">>
): Promise<void> {
  try {
    const existingEntries = await getJournalEntries();
    const nextEntry: JournalRecord = {
      id: entry.id ?? generateJournalId(),
      timestamp: entry.timestamp ?? new Date().toISOString(),
      originalThought: entry.originalThought,
      source: entry.source ?? "reflection",
      verdict: entry.verdict,
      primaryPattern: entry.primaryPattern,
      intensity: entry.intensity,
      mirrorLine: entry.mirrorLine,
      reframePrompt: entry.reframePrompt,
      dopamineDrain: entry.dopamineDrain,
      emotionProfile: entry.emotionProfile,
      journalEntry: entry.journalEntry
    };

    existingEntries.push(nextEntry);
    await writeJournalEntries(existingEntries);
  } catch {
    // Journal persistence should never interrupt the reflection flow.
  }
}

export async function replaceJournalEntries(entries: JournalRecord[]): Promise<void> {
  try {
    await writeJournalEntries(entries);
  } catch {
    // Journal persistence should never interrupt the reflection flow.
  }
}

export async function clearJournalEntries(): Promise<void> {
  try {
    await AsyncStorage.removeItem(JOURNAL_STORAGE_KEY);
  } catch {
    // Journal persistence should never interrupt the reflection flow.
  }
}
