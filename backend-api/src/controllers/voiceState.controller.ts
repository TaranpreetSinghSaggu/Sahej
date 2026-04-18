import { RequestHandler } from "express";

import { AppError } from "../middleware/error.middleware";
import { VoiceStateRequestBody, VoiceStateResult } from "../types/voiceState";
import { getOptionalInteger, getOptionalVolumeTrend, getRequiredTrimmedText } from "../utils/requestValidation";
import { analyzeVoiceState } from "../utils/voiceState";

export const voiceState: RequestHandler<
  Record<string, never>,
  VoiceStateResult,
  VoiceStateRequestBody
> = (req, res, next) => {
  try {
    const transcript = getRequiredTrimmedText(req.body?.transcript, "transcript");
    const speechMeta = {
      wordsPerMinute: getOptionalInteger(req.body?.wordsPerMinute, "wordsPerMinute", {
        min: 0
      }),
      pauseCount: getOptionalInteger(req.body?.pauseCount, "pauseCount", {
        min: 0
      }),
      volumeTrend: getOptionalVolumeTrend(req.body?.volumeTrend, "volumeTrend")
    };

    return res.status(200).json(analyzeVoiceState(transcript, speechMeta));
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(error);
  }
};
