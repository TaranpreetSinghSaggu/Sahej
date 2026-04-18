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
    "dopamineDrain",
    "emotionProfile",
    "journalEntry"
];
const EMOTION_PROFILE_KEYS = [
    "primaryEmotion",
    "secondaryEmotion",
    "underlyingNeed",
    "bodyColor",
    "colorName",
    "explanation"
];
const JOURNAL_ENTRY_KEYS = ["summary", "awarenessPrompt"];
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
    const record = payload;
    assertExactObjectKeys(record.emotionProfile, EMOTION_PROFILE_KEYS);
    assertExactObjectKeys(record.journalEntry, JOURNAL_ENTRY_KEYS);
    strict_1.default.match(record.emotionProfile.bodyColor, /^#[0-9A-F]{6}$/i);
}
const main = async () => {
    const server = app_1.default.listen(0);
    try {
        await (0, node_events_1.once)(server, "listening");
        const address = server.address();
        const baseUrl = `http://127.0.0.1:${address.port}`;
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
        console.log("Reflect endpoint verification passed.");
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
    console.error("Reflect endpoint verification failed.");
    console.error(error);
    process.exitCode = 1;
});
