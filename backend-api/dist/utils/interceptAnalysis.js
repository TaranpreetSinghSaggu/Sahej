"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeIntercept = void 0;
const PASSIVE_CONSUMPTION_TERMS = ["doomscroll", "shorts", "reels"];
const COMPULSIVE_CHECKING_TERMS = ["need to check", "check again", "reply", "responded"];
const includesAny = (value, terms) => terms.some((term) => value.includes(term));
const analyzeIntercept = (normalizedThought, metadata) => {
    if (includesAny(normalizedThought, COMPULSIVE_CHECKING_TERMS)) {
        return {
            shouldInterrupt: true,
            reason: "compulsive_checking",
            urgeLabels: ["seeking_control", "seeking_validation", "seeking_relief"],
            promptLine: "Name the urge before you obey it."
        };
    }
    if (includesAny(normalizedThought, PASSIVE_CONSUMPTION_TERMS)) {
        return {
            shouldInterrupt: true,
            reason: "passive_consumption",
            urgeLabels: ["seeking_relief", "avoiding_discomfort", "seeking_control"],
            promptLine: "Pause before you feed the scroll."
        };
    }
    if (typeof metadata.localHour === "number" && (metadata.localHour <= 5 || metadata.localHour >= 23)) {
        return {
            shouldInterrupt: true,
            reason: "late_night_reactivity",
            urgeLabels: ["seeking_relief", "seeking_validation"],
            promptLine: "It is late. Wait for a steadier hour."
        };
    }
    if (metadata.typingBurst || (metadata.openedCount5m ?? 0) >= 3) {
        return {
            shouldInterrupt: true,
            reason: "rapid_reactivity",
            urgeLabels: ["seeking_control", "avoiding_discomfort"],
            promptLine: "Slow down before you turn feeling into action."
        };
    }
    return {
        shouldInterrupt: false,
        reason: "steady",
        urgeLabels: [],
        promptLine: "Proceed with awareness."
    };
};
exports.analyzeIntercept = analyzeIntercept;
