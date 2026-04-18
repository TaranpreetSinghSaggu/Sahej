"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reflect = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const fallbackReflection_1 = require("../utils/fallbackReflection");
const mockReflection_1 = require("../utils/mockReflection");
const normalizeThought_1 = require("../utils/normalizeThought");
const requestValidation_1 = require("../utils/requestValidation");
const sessionId_1 = require("../utils/sessionId");
const sessionMemory_1 = require("../utils/sessionMemory");
const reflect = (req, res, next) => {
    let trimmedThought;
    try {
        trimmedThought = (0, requestValidation_1.getRequiredTrimmedText)(req.body?.thought, "thought");
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            return next(error);
        }
        return next(error);
    }
    try {
        const normalizedThought = (0, normalizeThought_1.normalizeThought)(trimmedThought);
        const reflection = (0, mockReflection_1.createMockReflection)(normalizedThought);
        const sessionId = (0, sessionId_1.getSessionId)(req.headers["x-session-id"]);
        (0, sessionMemory_1.appendSessionReflectionEvent)(sessionId, {
            timestamp: new Date().toISOString(),
            thought: trimmedThought,
            verdict: reflection.verdict,
            primaryPattern: reflection.primaryPattern,
            intensity: reflection.intensity,
            dopamineDrain: reflection.dopamineDrain
        });
        return res.status(200).json(reflection);
    }
    catch (error) {
        console.error("Unexpected reflect fallback", error);
        return res.status(200).json((0, fallbackReflection_1.fallbackReflection)());
    }
};
exports.reflect = reflect;
