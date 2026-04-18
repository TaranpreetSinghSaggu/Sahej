"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voiceState = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const requestValidation_1 = require("../utils/requestValidation");
const voiceState_1 = require("../utils/voiceState");
const voiceState = (req, res, next) => {
    try {
        const transcript = (0, requestValidation_1.getRequiredTrimmedText)(req.body?.transcript, "transcript");
        const speechMeta = {
            wordsPerMinute: (0, requestValidation_1.getOptionalInteger)(req.body?.wordsPerMinute, "wordsPerMinute", {
                min: 0
            }),
            pauseCount: (0, requestValidation_1.getOptionalInteger)(req.body?.pauseCount, "pauseCount", {
                min: 0
            }),
            volumeTrend: (0, requestValidation_1.getOptionalVolumeTrend)(req.body?.volumeTrend, "volumeTrend")
        };
        return res.status(200).json((0, voiceState_1.analyzeVoiceState)(transcript, speechMeta));
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            return next(error);
        }
        return next(error);
    }
};
exports.voiceState = voiceState;
