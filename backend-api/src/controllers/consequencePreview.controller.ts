import { RequestHandler } from "express";

import { AppError } from "../middleware/error.middleware";
import {
  ConsequencePreviewRequestBody,
  ConsequencePreviewResult
} from "../types/consequencePreview";
import { buildConsequencePreview } from "../utils/consequencePreview";
import { createMockReflection } from "../utils/mockReflection";
import { normalizeThought } from "../utils/normalizeThought";
import { getOptionalReflectionPattern, getRequiredTrimmedText } from "../utils/requestValidation";

export const consequencePreview: RequestHandler<
  Record<string, never>,
  ConsequencePreviewResult,
  ConsequencePreviewRequestBody
> = (req, res, next) => {
  try {
    const thought = getRequiredTrimmedText(req.body?.thought, "thought");
    const normalizedThought = normalizeThought(thought);
    const primaryPattern =
      getOptionalReflectionPattern(req.body?.primaryPattern, "primaryPattern") ??
      createMockReflection(normalizedThought).primaryPattern;

    return res.status(200).json(buildConsequencePreview(primaryPattern));
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(error);
  }
};
