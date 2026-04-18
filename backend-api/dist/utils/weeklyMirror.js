"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWeeklyMirror = void 0;
const formatPattern = (pattern) => pattern === "none" ? "none" : pattern.replace(/_/g, " ");
const getMostFrequentPattern = (events) => {
    if (events.length === 0) {
        return "none";
    }
    const counts = new Map();
    for (const event of events) {
        counts.set(event.primaryPattern, (counts.get(event.primaryPattern) ?? 0) + 1);
    }
    let winner = "none";
    let highestCount = 0;
    for (const [pattern, count] of counts.entries()) {
        if (count > highestCount) {
            winner = pattern;
            highestCount = count;
        }
    }
    return winner;
};
const buildWeeklyMirror = (events) => {
    if (events.length === 0) {
        return {
            dominantPattern: "none",
            strongestAuthenticPattern: "none",
            summary: "Start reflecting to reveal your weekly mirror.",
            recoveryMetrics: {
                totalReflections: 0,
                autopilotCount: 0,
                authenticCount: 0,
                dopamineDrainCount: 0,
                autopilotRate: 0
            }
        };
    }
    const autopilotEvents = events.filter((event) => event.verdict === "AUTOPILOT");
    const authenticEvents = events.filter((event) => event.verdict === "AUTHENTIC");
    const dominantPattern = getMostFrequentPattern(events);
    const strongestAuthenticPattern = getMostFrequentPattern(authenticEvents);
    const dopamineDrainCount = events.filter((event) => event.dopamineDrain).length;
    const autopilotRate = Number((autopilotEvents.length / events.length).toFixed(2));
    const summary = autopilotEvents.length >= authenticEvents.length
        ? `This session keeps circling ${formatPattern(dominantPattern)}. Slow the loop before it hardens.`
        : `This session is moving toward ${formatPattern(strongestAuthenticPattern)}. Keep that steadiness.`;
    return {
        dominantPattern,
        strongestAuthenticPattern,
        summary,
        recoveryMetrics: {
            totalReflections: events.length,
            autopilotCount: autopilotEvents.length,
            authenticCount: authenticEvents.length,
            dopamineDrainCount,
            autopilotRate
        }
    };
};
exports.buildWeeklyMirror = buildWeeklyMirror;
