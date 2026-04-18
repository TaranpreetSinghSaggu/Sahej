import { RequestHandler } from "express";

import { AppError } from "../middleware/error.middleware";
import { fallbackReflection } from "../utils/fallbackReflection";
import { createMockReflection } from "../utils/mockReflection";
import { normalizeThought } from "../utils/normalizeThought";
import { getRequiredTrimmedText } from "../utils/requestValidation";
import { getSessionId } from "../utils/sessionId";
import { appendSessionReflectionEvent } from "../utils/sessionMemory";
import { ReflectionResult, ReflectRequestBody } from "../types/reflection";

export const reflect: RequestHandler<
  Record<string, never>,
  ReflectionResult,
  ReflectRequestBody
> = (req, res, next) => {
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
    const reflection = createMockReflection(normalizedThought);
    const sessionId = getSessionId(req.headers["x-session-id"]);

    appendSessionReflectionEvent(sessionId, {
      timestamp: new Date().toISOString(),
      thought: trimmedThought,
      verdict: reflection.verdict,
      primaryPattern: reflection.primaryPattern,
      intensity: reflection.intensity,
      dopamineDrain: reflection.dopamineDrain
    });

    return res.status(200).json(reflection);
  } catch (error) {
    console.error("Unexpected reflect fallback", error);

    return res.status(200).json(fallbackReflection());
  }
};
