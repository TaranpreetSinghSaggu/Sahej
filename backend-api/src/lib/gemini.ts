import { env } from "./env";
import { EmotionProfile, JournalEntry, ReflectionResult } from "../types/reflection";

const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MIN_GEMINI_TIMEOUT_MS = 450;
const MAX_GEMINI_TIMEOUT_MS = 2600;

interface ReflectionEnrichment {
  mirrorLine: string;
  reframePrompt: string;
  emotionProfile: EmotionProfile;
  journalEntry: JournalEntry;
}

class GeminiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiRequestError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isEmotionProfile(value: unknown): value is EmotionProfile {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasText(value.primaryEmotion) &&
    hasText(value.secondaryEmotion) &&
    hasText(value.underlyingNeed) &&
    isHexColor(value.bodyColor) &&
    hasText(value.colorName) &&
    hasText(value.explanation)
  );
}

function isJournalEntry(value: unknown): value is JournalEntry {
  if (!isRecord(value)) {
    return false;
  }

  return hasText(value.summary) && hasText(value.awarenessPrompt);
}

function isReflectionEnrichment(value: unknown): value is ReflectionEnrichment {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasText(value.mirrorLine) &&
    hasText(value.reframePrompt) &&
    isEmotionProfile(value.emotionProfile) &&
    isJournalEntry(value.journalEntry)
  );
}

function extractCandidateText(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  const candidates = payload.candidates;

  if (!Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }

  const firstCandidate = candidates[0];

  if (!isRecord(firstCandidate)) {
    return null;
  }

  const content = firstCandidate.content;

  if (!isRecord(content)) {
    return null;
  }

  const parts = content.parts;

  if (!Array.isArray(parts) || parts.length === 0) {
    return null;
  }

  const firstPart = parts[0];

  if (!isRecord(firstPart) || typeof firstPart.text !== "string") {
    return null;
  }

  return firstPart.text;
}

function stripJsonFences(value: string) {
  return value.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
}

function createPrompt(thought: string, baseReflection: ReflectionResult) {
  return [
    "You are Sahej, a calm psychological mirror for a hackathon demo.",
    "The app has already classified the thought. Treat the locked fields below as fixed context.",
    "Do not change or return verdict, primaryPattern, intensity, or dopamineDrain.",
    "Return exactly one JSON object with no markdown and no extra text.",
    "Return exactly these keys: mirrorLine, reframePrompt, emotionProfile, journalEntry.",
    "mirrorLine should be one concise psychologically sharp sentence.",
    "reframePrompt should be one concise calm actionable sentence.",
    "emotionProfile must contain: primaryEmotion, secondaryEmotion, underlyingNeed, bodyColor, colorName, explanation.",
    "bodyColor must be a 7-character hex color like #5B6CFF.",
    "Go deeper than surface labels and capture layered emotions such as anger over hurt or validation-seeking over insecurity.",
    "underlyingNeed should be emotionally meaningful, such as safety, respect, reassurance, belonging, control, rest, or truth.",
    "journalEntry must contain: summary, awarenessPrompt.",
    `Locked classification: ${JSON.stringify({
      verdict: baseReflection.verdict,
      primaryPattern: baseReflection.primaryPattern,
      intensity: baseReflection.intensity,
      dopamineDrain: baseReflection.dopamineDrain
    })}`,
    `Thought: ${JSON.stringify(thought)}`
  ].join("\n");
}

function getGeminiErrorMessage(payload: unknown, status: number) {
  if (
    isRecord(payload) &&
    isRecord(payload.error) &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }

  return `Gemini request failed with status ${status}.`;
}

async function requestGeminiEnrichment(
  thought: string,
  baseReflection: ReflectionResult,
  timeoutMs: number
): Promise<ReflectionResult> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, timeoutMs);

  try {
    const response = await fetch(
      `${GEMINI_API_BASE_URL}/${encodeURIComponent(env.geminiModel)}:generateContent?key=${encodeURIComponent(env.geminiApiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          },
          contents: [
            {
              parts: [
                {
                  text: createPrompt(thought, baseReflection)
                }
              ]
            }
          ]
        }),
        signal: abortController.signal
      }
    );

    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      throw new GeminiRequestError("Gemini returned unreadable JSON.");
    }

    if (!response.ok) {
      throw new GeminiRequestError(getGeminiErrorMessage(payload, response.status));
    }

    const candidateText = extractCandidateText(payload);

    if (!candidateText) {
      throw new GeminiRequestError("Gemini returned no reflection enrichment.");
    }

    let parsedEnrichment: unknown;

    try {
      parsedEnrichment = JSON.parse(stripJsonFences(candidateText));
    } catch {
      throw new GeminiRequestError("Gemini returned invalid reflection JSON.");
    }

    if (!isReflectionEnrichment(parsedEnrichment)) {
      throw new GeminiRequestError("Gemini returned an unexpected reflection enrichment shape.");
    }

    return {
      ...baseReflection,
      mirrorLine: parsedEnrichment.mirrorLine.trim(),
      reframePrompt: parsedEnrichment.reframePrompt.trim(),
      emotionProfile: {
        primaryEmotion: parsedEnrichment.emotionProfile.primaryEmotion.trim(),
        secondaryEmotion: parsedEnrichment.emotionProfile.secondaryEmotion.trim(),
        underlyingNeed: parsedEnrichment.emotionProfile.underlyingNeed.trim(),
        bodyColor: parsedEnrichment.emotionProfile.bodyColor.toUpperCase(),
        colorName: parsedEnrichment.emotionProfile.colorName.trim(),
        explanation: parsedEnrichment.emotionProfile.explanation.trim()
      },
      journalEntry: {
        summary: parsedEnrichment.journalEntry.summary.trim(),
        awarenessPrompt: parsedEnrichment.journalEntry.awarenessPrompt.trim()
      }
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new GeminiRequestError(`Gemini timed out after ${timeoutMs}ms.`);
    }

    if (error instanceof GeminiRequestError) {
      throw error;
    }

    throw new GeminiRequestError("Gemini request failed unexpectedly.");
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateReflectionWithGemini(
  thought: string,
  baseReflection: ReflectionResult
): Promise<ReflectionResult> {
  if (!env.geminiApiKey) {
    throw new GeminiRequestError("Missing GEMINI_API_KEY.");
  }

  // Gemini enrichment is best-effort only; demo flow must never depend on it.
  const timeoutMs = Math.min(
    MAX_GEMINI_TIMEOUT_MS,
    Math.max(MIN_GEMINI_TIMEOUT_MS, env.geminiTimeoutMs)
  );

  return requestGeminiEnrichment(thought, baseReflection, timeoutMs);
}
