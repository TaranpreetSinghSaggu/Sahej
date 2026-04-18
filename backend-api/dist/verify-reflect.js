"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_events_1 = require("node:events");
const app_1 = __importDefault(require("./app"));
const REFLECTION_KEYS = [
    "verdict",
    "primaryPattern",
    "intensity",
    "mirrorLine",
    "reframePrompt",
    "dopamineDrain"
];
const INTERCEPT_KEYS = [
    "shouldInterrupt",
    "reason",
    "urgeLabels",
    "promptLine"
];
const CONSEQUENCE_PREVIEW_KEYS = [
    "autopilotOutcome",
    "alignedOutcome",
    "suggestedAction"
];
const VOICE_STATE_KEYS = [
    "stateLabel",
    "toneSignal",
    "mirrorLine",
    "nextStepPrompt"
];
const WEEKLY_MIRROR_KEYS = [
    "dominantPattern",
    "strongestAuthenticPattern",
    "summary",
    "recoveryMetrics"
];
const createLongThought = () => "a".repeat(1001);
const createHeaders = (sessionId) => ({
    "Content-Type": "application/json",
    ...(sessionId ? { "x-session-id": sessionId } : {})
});
const postJson = async (baseUrl, path, body, sessionId) => fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: createHeaders(sessionId),
    body: JSON.stringify(body)
});
function assertExactObjectKeys(payload, expectedKeys) {
    strict_1.default.equal(typeof payload, "object");
    strict_1.default.notEqual(payload, null);
    const keys = Object.keys(payload).sort();
    strict_1.default.deepEqual(keys, [...expectedKeys].sort());
}
function assertReflectionShape(payload) {
    assertExactObjectKeys(payload, REFLECTION_KEYS);
}
function assertInterceptShape(payload) {
    assertExactObjectKeys(payload, INTERCEPT_KEYS);
    const record = payload;
    strict_1.default.ok(Array.isArray(record.urgeLabels));
}
function assertConsequencePreviewShape(payload) {
    assertExactObjectKeys(payload, CONSEQUENCE_PREVIEW_KEYS);
}
function assertVoiceStateShape(payload) {
    assertExactObjectKeys(payload, VOICE_STATE_KEYS);
}
function assertWeeklyMirrorShape(payload) {
    assertExactObjectKeys(payload, WEEKLY_MIRROR_KEYS);
    const record = payload;
    strict_1.default.equal(typeof record.recoveryMetrics, "object");
}
const main = async () => {
    const server = app_1.default.listen(0);
    try {
        await (0, node_events_1.once)(server, "listening");
        const address = server.address();
        const baseUrl = `http://127.0.0.1:${address.port}`;
        const weeklySessionId = `verify-session-${Date.now()}`;
        const healthResponse = await fetch(`${baseUrl}/health`);
        strict_1.default.equal(healthResponse.status, 200);
        strict_1.default.deepEqual(await healthResponse.json(), { ok: true });
        const missingThoughtResponse = await postJson(baseUrl, "/reflect", {});
        strict_1.default.equal(missingThoughtResponse.status, 400);
        strict_1.default.deepEqual(await missingThoughtResponse.json(), {
            error: "thought is required and must be a string"
        });
        const nonStringThoughtResponse = await postJson(baseUrl, "/reflect", { thought: 42 });
        strict_1.default.equal(nonStringThoughtResponse.status, 400);
        strict_1.default.deepEqual(await nonStringThoughtResponse.json(), {
            error: "thought is required and must be a string"
        });
        const emptyThoughtResponse = await postJson(baseUrl, "/reflect", { thought: "   " });
        strict_1.default.equal(emptyThoughtResponse.status, 400);
        strict_1.default.deepEqual(await emptyThoughtResponse.json(), {
            error: "thought must not be empty"
        });
        const longThoughtResponse = await postJson(baseUrl, "/reflect", {
            thought: createLongThought()
        });
        strict_1.default.equal(longThoughtResponse.status, 400);
        strict_1.default.deepEqual(await longThoughtResponse.json(), {
            error: "thought must be 1000 characters or fewer"
        });
        const angryThoughtResponse = await postJson(baseUrl, "/reflect", {
            thought: "I am angry and want to prove them wrong"
        });
        strict_1.default.equal(angryThoughtResponse.status, 200);
        const angryThoughtPayload = await angryThoughtResponse.json();
        assertReflectionShape(angryThoughtPayload);
        strict_1.default.equal(angryThoughtPayload.verdict, "AUTOPILOT");
        strict_1.default.equal(angryThoughtPayload.primaryPattern, "ego");
        strict_1.default.equal(angryThoughtPayload.dopamineDrain, false);
        const reelsThoughtResponse = await postJson(baseUrl, "/reflect", {
            thought: "I spent 2 hours on reels again"
        });
        strict_1.default.equal(reelsThoughtResponse.status, 200);
        const reelsThoughtPayload = await reelsThoughtResponse.json();
        assertReflectionShape(reelsThoughtPayload);
        strict_1.default.equal(reelsThoughtPayload.verdict, "AUTOPILOT");
        strict_1.default.equal(reelsThoughtPayload.primaryPattern, "fear");
        strict_1.default.equal(reelsThoughtPayload.dopamineDrain, true);
        const calmThoughtResponse = await postJson(baseUrl, "/reflect", {
            thought: "I want to respond calmly and do what is right"
        });
        strict_1.default.equal(calmThoughtResponse.status, 200);
        const calmThoughtPayload = await calmThoughtResponse.json();
        assertReflectionShape(calmThoughtPayload);
        strict_1.default.equal(calmThoughtPayload.verdict, "AUTHENTIC");
        strict_1.default.equal(calmThoughtPayload.primaryPattern, "grounded");
        strict_1.default.equal(calmThoughtPayload.dopamineDrain, false);
        const doomscrollInterceptResponse = await postJson(baseUrl, "/intercept", {
            thought: "I am doomscrolling reels again"
        });
        strict_1.default.equal(doomscrollInterceptResponse.status, 200);
        const doomscrollInterceptPayload = await doomscrollInterceptResponse.json();
        assertInterceptShape(doomscrollInterceptPayload);
        strict_1.default.equal(doomscrollInterceptPayload.shouldInterrupt, true);
        strict_1.default.equal(doomscrollInterceptPayload.reason, "passive_consumption");
        const lateNightInterceptResponse = await postJson(baseUrl, "/intercept", {
            thought: "I want to message them",
            localHour: 1
        });
        strict_1.default.equal(lateNightInterceptResponse.status, 200);
        const lateNightInterceptPayload = await lateNightInterceptResponse.json();
        assertInterceptShape(lateNightInterceptPayload);
        strict_1.default.equal(lateNightInterceptPayload.reason, "late_night_reactivity");
        const checkingInterceptResponse = await postJson(baseUrl, "/intercept", {
            thought: "I need to check if they replied again"
        });
        strict_1.default.equal(checkingInterceptResponse.status, 200);
        const checkingInterceptPayload = await checkingInterceptResponse.json();
        assertInterceptShape(checkingInterceptPayload);
        strict_1.default.equal(checkingInterceptPayload.reason, "compulsive_checking");
        const consequencePreviewResponse = await postJson(baseUrl, "/consequence-preview", {
            thought: "I am angry and want to prove them wrong"
        });
        strict_1.default.equal(consequencePreviewResponse.status, 200);
        const consequencePreviewPayload = await consequencePreviewResponse.json();
        assertConsequencePreviewShape(consequencePreviewPayload);
        strict_1.default.equal(typeof consequencePreviewPayload.autopilotOutcome, "string");
        strict_1.default.equal(typeof consequencePreviewPayload.alignedOutcome, "string");
        const calmVoiceResponse = await postJson(baseUrl, "/voice-state", {
            transcript: "I want to respond slowly and clearly."
        });
        strict_1.default.equal(calmVoiceResponse.status, 200);
        const calmVoicePayload = await calmVoiceResponse.json();
        assertVoiceStateShape(calmVoicePayload);
        strict_1.default.equal(calmVoicePayload.stateLabel, "calm");
        const defensiveVoiceResponse = await postJson(baseUrl, "/voice-state", {
            transcript: "I am fine, I just want to move on.",
            wordsPerMinute: 125,
            pauseCount: 0
        });
        strict_1.default.equal(defensiveVoiceResponse.status, 200);
        const defensiveVoicePayload = await defensiveVoiceResponse.json();
        assertVoiceStateShape(defensiveVoicePayload);
        strict_1.default.equal(defensiveVoicePayload.stateLabel, "defensive");
        const urgentVoiceResponse = await postJson(baseUrl, "/voice-state", {
            transcript: "I need to send this right now",
            wordsPerMinute: 182,
            volumeTrend: "rising"
        });
        strict_1.default.equal(urgentVoiceResponse.status, 200);
        const urgentVoicePayload = await urgentVoiceResponse.json();
        assertVoiceStateShape(urgentVoicePayload);
        strict_1.default.equal(urgentVoicePayload.stateLabel, "urgent");
        const emptyWeeklyMirrorResponse = await fetch(`${baseUrl}/weekly-mirror`, {
            headers: createHeaders(weeklySessionId)
        });
        strict_1.default.equal(emptyWeeklyMirrorResponse.status, 200);
        const emptyWeeklyMirrorPayload = await emptyWeeklyMirrorResponse.json();
        assertWeeklyMirrorShape(emptyWeeklyMirrorPayload);
        strict_1.default.equal(emptyWeeklyMirrorPayload.recoveryMetrics.totalReflections, 0);
        await postJson(baseUrl, "/reflect", { thought: "I spent 2 hours on reels again" }, weeklySessionId);
        await postJson(baseUrl, "/reflect", { thought: "I feel jealous and small right now" }, weeklySessionId);
        await postJson(baseUrl, "/reflect", { thought: "I want to respond calmly and do what is right" }, weeklySessionId);
        const weeklyMirrorResponse = await fetch(`${baseUrl}/weekly-mirror`, {
            headers: createHeaders(weeklySessionId)
        });
        strict_1.default.equal(weeklyMirrorResponse.status, 200);
        const weeklyMirrorPayload = await weeklyMirrorResponse.json();
        assertWeeklyMirrorShape(weeklyMirrorPayload);
        strict_1.default.equal(weeklyMirrorPayload.dominantPattern, "fear");
        strict_1.default.equal(weeklyMirrorPayload.strongestAuthenticPattern, "grounded");
        strict_1.default.equal(weeklyMirrorPayload.recoveryMetrics.totalReflections, 3);
        strict_1.default.equal(weeklyMirrorPayload.recoveryMetrics.autopilotCount, 2);
        strict_1.default.equal(weeklyMirrorPayload.recoveryMetrics.authenticCount, 1);
        strict_1.default.equal(weeklyMirrorPayload.recoveryMetrics.dopamineDrainCount, 1);
        strict_1.default.equal(weeklyMirrorPayload.recoveryMetrics.autopilotRate, 0.67);
        console.log("Backend endpoint verification passed.");
    }
    finally {
        await new Promise((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
};
main().catch((error) => {
    console.error("Backend endpoint verification failed.");
    console.error(error);
    process.exitCode = 1;
});
