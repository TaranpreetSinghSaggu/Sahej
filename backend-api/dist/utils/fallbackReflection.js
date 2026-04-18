"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fallbackReflection = void 0;
const FALLBACK_REFLECTION = {
    verdict: "AUTHENTIC",
    primaryPattern: "grounded",
    intensity: 1,
    mirrorLine: "Pause for a breath and notice what is really here.",
    reframePrompt: "Choose your next step with calm clarity.",
    dopamineDrain: false
};
const fallbackReflection = () => FALLBACK_REFLECTION;
exports.fallbackReflection = fallbackReflection;
