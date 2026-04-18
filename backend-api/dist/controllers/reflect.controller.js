"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reflect = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const fallbackReflection_1 = require("../utils/fallbackReflection");
const gemini_1 = require("../lib/gemini");
const openai_1 = require("../lib/openai");
const env_1 = require("../lib/env");
const mockReflection_1 = require("../utils/mockReflection");
const normalizeThought_1 = require("../utils/normalizeThought");
const requestValidation_1 = require("../utils/requestValidation");
const sessionId_1 = require("../utils/sessionId");
const sessionMemory_1 = require("../utils/sessionMemory");
async function runEnrichmentAttempt(providerName, budgetMs, task) {
    console.info(`Reflect ${providerName} enrichment started`);
    let timeoutId;
    const result = await Promise.race([
        (async () => {
            try {
                const enrichedReflection = await task();
                return {
                    type: "success",
                    reflection: enrichedReflection
                };
            }
            catch (error) {
                return {
                    type: "failed",
                    error
                };
            }
        })(),
        new Promise((resolve) => {
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
const reflect = async (req, res, next) => {
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
        // Deterministic reflection is always ready first; AI enrichment is optional.
        const baseReflection = (0, mockReflection_1.createMockReflection)(normalizedThought);
        console.info("Reflect local reflection created");
        let reflection = baseReflection;
        if (env_1.env.demoMode) {
            console.info("Reflect demo mode enabled. Returning deterministic reflection.");
        }
        else if (trimmedThought) {
            // Enrichment is best-effort only; the demo flow must never depend on any external model.
            const openAIResult = await runEnrichmentAttempt("OpenAI", env_1.env.openaiBestEffortBudgetMs, () => (0, openai_1.generateReflectionWithOpenAI)(trimmedThought, baseReflection));
            if (openAIResult.type === "success") {
                reflection = openAIResult.reflection;
            }
            else {
                if (openAIResult.type === "timeout") {
                    console.warn(`Reflect OpenAI enrichment timed out after ${env_1.env.openaiBestEffortBudgetMs}ms budget.`);
                }
                else {
                    console.warn("Reflect OpenAI enrichment failed.", openAIResult.error);
                }
                const geminiResult = await runEnrichmentAttempt("Gemini", env_1.env.geminiBestEffortBudgetMs, () => (0, gemini_1.generateReflectionWithGemini)(trimmedThought, baseReflection));
                if (geminiResult.type === "success") {
                    reflection = geminiResult.reflection;
                }
                else if (geminiResult.type === "timeout") {
                    console.warn(`Reflect Gemini enrichment timed out after ${env_1.env.geminiBestEffortBudgetMs}ms budget.`);
                }
                else {
                    console.warn("Reflect Gemini enrichment failed.", geminiResult.error);
                }
            }
        }
        const sessionId = (0, sessionId_1.getSessionId)(req.headers["x-session-id"]);
        (0, sessionMemory_1.appendSessionReflectionEvent)(sessionId, {
            timestamp: new Date().toISOString(),
            thought: trimmedThought,
            verdict: reflection.verdict,
            primaryPattern: reflection.primaryPattern,
            intensity: reflection.intensity,
            dopamineDrain: reflection.dopamineDrain
        });
        console.info("Reflect response returned");
        return res.status(200).json(reflection);
    }
    catch (error) {
        console.error("Unexpected reflect fallback", error);
        return res.status(200).json((0, fallbackReflection_1.fallbackReflection)());
    }
};
exports.reflect = reflect;
