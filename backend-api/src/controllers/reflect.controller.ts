import { RequestHandler } from "express";

import { AppError } from "../middleware/error.middleware";
import { fallbackReflection } from "../utils/fallbackReflection";
import { generateReflectionWithGemini } from "../lib/gemini";
import { generateReflectionWithOpenAI } from "../lib/openai";
import { env } from "../lib/env";
import { createMockReflection } from "../utils/mockReflection";
import { normalizeThought } from "../utils/normalizeThought";
import { getRequiredTrimmedText } from "../utils/requestValidation";
import { getSessionId } from "../utils/sessionId";
import { appendSessionReflectionEvent } from "../utils/sessionMemory";
import { ReflectionResult, ReflectRequestBody } from "../types/reflection";

type EnrichmentAttempt =
  | { type: "success"; reflection: ReflectionResult }
  | { type: "failed"; error: unknown }
  | { type: "timeout" };

async function runEnrichmentAttempt(
  providerName: "OpenAI" | "Gemini",
  budgetMs: number,
  task: () => Promise<ReflectionResult>
): Promise<EnrichmentAttempt> {
  console.info(`Reflect ${providerName} enrichment started`);
  let timeoutId: NodeJS.Timeout | undefined;
  const result = await Promise.race<EnrichmentAttempt>([
    (async () => {
      try {
        const enrichedReflection = await task();
        return {
          type: "success" as const,
          reflection: enrichedReflection
        };
      } catch (error) {
        return {
          type: "failed" as const,
          error
        };
      }
    })(),
    new Promise<{ type: "timeout" }>((resolve) => {
      timeoutId = setTimeout(() => {
        resolve({
          type: "timeout"
        });
      }, budgetMs);
    })
  ]);

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  return result;
}

export const reflect: RequestHandler<
  Record<string, never>,
  ReflectionResult,
  ReflectRequestBody
> = async (req, res, next) => {
  let trimmedThought: string;

  try {
    trimmedThought = getRequiredTrimmedText(req.body?.thought, "thought");
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(error);
  }

  try {
    const normalizedThought = normalizeThought(trimmedThought);
    // Deterministic reflection is always ready first; AI enrichment is optional.
    const baseReflection = createMockReflection(normalizedThought);
    console.info("Reflect local reflection created");
    let reflection = baseReflection;

    if (env.demoMode) {
      console.info("Reflect demo mode enabled. Returning deterministic reflection.");
    } else if (trimmedThought) {
      // Enrichment is best-effort only; the demo flow must never depend on any external model.
      const openAIResult = await runEnrichmentAttempt(
        "OpenAI",
        env.openaiBestEffortBudgetMs,
        () => generateReflectionWithOpenAI(trimmedThought, baseReflection)
      );

      if (openAIResult.type === "success") {
        reflection = openAIResult.reflection;
      } else {
        if (openAIResult.type === "timeout") {
          console.warn(
            `Reflect OpenAI enrichment timed out after ${env.openaiBestEffortBudgetMs}ms budget.`
          );
        } else {
          console.warn("Reflect OpenAI enrichment failed.", openAIResult.error);
        }

        const geminiResult = await runEnrichmentAttempt(
          "Gemini",
          env.geminiBestEffortBudgetMs,
          () => generateReflectionWithGemini(trimmedThought, baseReflection)
        );

        if (geminiResult.type === "success") {
          reflection = geminiResult.reflection;
        } else if (geminiResult.type === "timeout") {
          console.warn(
            `Reflect Gemini enrichment timed out after ${env.geminiBestEffortBudgetMs}ms budget.`
          );
        } else {
          console.warn("Reflect Gemini enrichment failed.", geminiResult.error);
        }
      }
    }

    const sessionId = getSessionId(req.headers["x-session-id"]);

    appendSessionReflectionEvent(sessionId, {
      timestamp: new Date().toISOString(),
      thought: trimmedThought,
      verdict: reflection.verdict,
      primaryPattern: reflection.primaryPattern,
      intensity: reflection.intensity,
      dopamineDrain: reflection.dopamineDrain
    });

    console.info("Reflect response returned");
    return res.status(200).json(reflection);
  } catch (error) {
    console.error("Unexpected reflect fallback", error);
    return res.status(200).json(fallbackReflection());
  }
};
