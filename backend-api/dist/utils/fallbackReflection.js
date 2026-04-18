"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fallbackReflection = void 0;
const FALLBACK_REFLECTION = {
    verdict: "AUTHENTIC",
    primaryPattern: "grounded",
    intensity: 1,
    mirrorLine: "Pause for a breath and notice what is really here.",
    reframePrompt: "Choose your next step with calm clarity.",
    dopamineDrain: false,
    emotionProfile: {
        primaryEmotion: "settling",
        secondaryEmotion: "openness",
        underlyingNeed: "safety",
        bodyColor: "#5B6CFF",
        colorName: "steady indigo",
        explanation: "This fallback reflection invites your system toward steadiness first, because clarity grows more easily from safety than urgency."
    },
    journalEntry: {
        summary: "I am being invited back to steadiness before deciding what this moment means.",
        awarenessPrompt: "What changes when I give myself one slower breath?"
    }
};
const fallbackReflection = () => FALLBACK_REFLECTION;
exports.fallbackReflection = fallbackReflection;
