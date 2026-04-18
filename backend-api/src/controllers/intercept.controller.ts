import { RequestHandler } from "express";

import { AppError } from "../middleware/error.middleware";
import { InterceptRequestBody, InterceptResult } from "../types/intercept";
import { analyzeIntercept } from "../utils/interceptAnalysis";
import { normalizeThought } from "../utils/normalizeThought";
import {
  getOptionalBoolean,
  getOptionalInteger,
  getRequiredTrimmedText
} from "../utils/requestValidation";

export const intercept: RequestHandler<
  Record<string, never>,
  InterceptResult,
  InterceptRequestBody
> = (req, res, next) => {
  try {
    const thought = getRequiredTrimmedText(req.body?.thought, "thought");
    const normalizedThought = normalizeThought(thought);
    const metadata = {
      openedCount5m: getOptionalInteger(req.body?.openedCount5m, "openedCount5m", {
        min: 0
      }),
      localHour: getOptionalInteger(req.body?.localHour, "localHour", {
        min: 0,
        max: 23
      }),
      typingBurst: getOptionalBoolean(req.body?.typingBurst, "typingBurst")
    };

    return res.status(200).json(analyzeIntercept(normalizedThought, metadata));
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(error);
  }
};
