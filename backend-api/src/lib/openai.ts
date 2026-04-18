import { env } from "./env";
import { EmotionProfile, JournalEntry, ReflectionResult } from "../types/reflection";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MIN_OPENAI_TIMEOUT_MS = 350;
const MAX_OPENAI_TIMEOUT_MS = 3200;

interface ReflectionEnrichment {
  mirrorLine: string;
  reframePrompt: string;
  emotionProfile: EmotionProfile;
  journalEntry: JournalEntry;
}

class OpenAIRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIRequestError";
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

function extractContent(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  const choices = payload.choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    return null;
  }

  const firstChoice = choices[0];
  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    return null;
  }

  const content = firstChoice.message.content;
  return typeof content === "string" ? content : null;
}

function getOpenAIErrorMessage(payload: unknown, status: number) {
  if (
    isRecord(payload) &&
    isRecord(payload.error) &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }

  return `OpenAI request failed with status ${status}.`;
}

async function requestOpenAIEnrichment(
  thought: string,
  baseReflection: ReflectionResult,
  timeoutMs: number
): Promise<ReflectionResult> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, timeoutMs);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.openaiApiKey}`
      },
      body: JSON.stringify({
        model: env.openaiModel,
        temperature: 0.2,
        response_format: {
          type: "json_object"
        },
        messages: [
          {
            role: "system",
            content:
              "You are a careful assistant returning valid JSON only. Never include markdown."
          },
          {
            role: "user",
            content: createPrompt(thought, baseReflection)
          }
        ]
      }),
      signal: abortController.signal
    });

    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      throw new OpenAIRequestError("OpenAI returned unreadable JSON.");
    }

    if (!response.ok) {
      throw new OpenAIRequestError(getOpenAIErrorMessage(payload, response.status));
    }

    const content = extractContent(payload);
    if (!content) {
      throw new OpenAIRequestError("OpenAI returned no enrichment content.");
    }

    let parsedEnrichment: unknown;

    try {
      parsedEnrichment = JSON.parse(stripJsonFences(content));
    } catch {
      throw new OpenAIRequestError("OpenAI returned invalid reflection JSON.");
    }

    if (!isReflectionEnrichment(parsedEnrichment)) {
      throw new OpenAIRequestError("OpenAI returned an unexpected enrichment shape.");
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
      throw new OpenAIRequestError(`OpenAI timed out after ${timeoutMs}ms.`);
    }

    if (error instanceof OpenAIRequestError) {
      throw error;
    }

    throw new OpenAIRequestError("OpenAI request failed unexpectedly.");
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateReflectionWithOpenAI(
  thought: string,
  baseReflection: ReflectionResult
): Promise<ReflectionResult> {
  if (!env.openaiApiKey) {
    throw new OpenAIRequestError("Missing OPENAI_API_KEY.");
  }

  const timeoutMs = Math.min(
    MAX_OPENAI_TIMEOUT_MS,
    Math.max(MIN_OPENAI_TIMEOUT_MS, env.openaiTimeoutMs)
  );

  return requestOpenAIEnrichment(thought, baseReflection, timeoutMs);
}
