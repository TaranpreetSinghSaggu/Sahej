import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";

import app from "./app";
import { ConsequencePreviewResult } from "./types/consequencePreview";
import { InterceptResult } from "./types/intercept";
import { ReflectionResult } from "./types/reflection";
import { VoiceStateResult } from "./types/voiceState";
import { WeeklyMirrorResult } from "./types/weeklyMirror";

const REFLECTION_KEYS: Array<keyof ReflectionResult> = [
  "verdict",
  "primaryPattern",
  "intensity",
  "mirrorLine",
  "reframePrompt",
  "dopamineDrain"
];
const INTERCEPT_KEYS: Array<keyof InterceptResult> = [
  "shouldInterrupt",
  "reason",
  "urgeLabels",
  "promptLine"
];
const CONSEQUENCE_PREVIEW_KEYS: Array<keyof ConsequencePreviewResult> = [
  "autopilotOutcome",
  "alignedOutcome",
  "suggestedAction"
];
const VOICE_STATE_KEYS: Array<keyof VoiceStateResult> = [
  "stateLabel",
  "toneSignal",
  "mirrorLine",
  "nextStepPrompt"
];
const WEEKLY_MIRROR_KEYS: Array<keyof WeeklyMirrorResult> = [
  "dominantPattern",
  "strongestAuthenticPattern",
  "summary",
  "recoveryMetrics"
];

const createLongThought = () => "a".repeat(1001);
const createHeaders = (sessionId?: string) => ({
  "Content-Type": "application/json",
  ...(sessionId ? { "x-session-id": sessionId } : {})
});

const postJson = async (
  baseUrl: string,
  path: string,
  body: unknown,
  sessionId?: string
) =>
  fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: createHeaders(sessionId),
    body: JSON.stringify(body)
  });

function assertExactObjectKeys(
  payload: unknown,
  expectedKeys: string[]
): asserts payload is Record<string, unknown> {
  assert.equal(typeof payload, "object");
  assert.notEqual(payload, null);

  const keys = Object.keys(payload as Record<string, unknown>).sort();
  assert.deepEqual(keys, [...expectedKeys].sort());
}

function assertReflectionShape(payload: unknown): asserts payload is ReflectionResult {
  assertExactObjectKeys(payload, REFLECTION_KEYS);
}

function assertInterceptShape(payload: unknown): asserts payload is InterceptResult {
  assertExactObjectKeys(payload, INTERCEPT_KEYS);
  const record = payload as Record<string, unknown>;
  assert.ok(Array.isArray(record.urgeLabels));
}

function assertConsequencePreviewShape(
  payload: unknown
): asserts payload is ConsequencePreviewResult {
  assertExactObjectKeys(payload, CONSEQUENCE_PREVIEW_KEYS);
}

function assertVoiceStateShape(payload: unknown): asserts payload is VoiceStateResult {
  assertExactObjectKeys(payload, VOICE_STATE_KEYS);
}

function assertWeeklyMirrorShape(payload: unknown): asserts payload is WeeklyMirrorResult {
  assertExactObjectKeys(payload, WEEKLY_MIRROR_KEYS);
  const record = payload as Record<string, unknown>;
  assert.equal(typeof record.recoveryMetrics, "object");
}

const main = async () => {
  const server = app.listen(0);

  try {
    await once(server, "listening");

    const address = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const weeklySessionId = `verify-session-${Date.now()}`;

    const healthResponse = await fetch(`${baseUrl}/health`);
    assert.equal(healthResponse.status, 200);
    assert.deepEqual(await healthResponse.json(), { ok: true });

    const missingThoughtResponse = await postJson(baseUrl, "/reflect", {});
    assert.equal(missingThoughtResponse.status, 400);
    assert.deepEqual(await missingThoughtResponse.json(), {
      error: "thought is required and must be a string"
    });

    const nonStringThoughtResponse = await postJson(baseUrl, "/reflect", { thought: 42 });
    assert.equal(nonStringThoughtResponse.status, 400);
    assert.deepEqual(await nonStringThoughtResponse.json(), {
      error: "thought is required and must be a string"
    });

    const emptyThoughtResponse = await postJson(baseUrl, "/reflect", { thought: "   " });
    assert.equal(emptyThoughtResponse.status, 400);
    assert.deepEqual(await emptyThoughtResponse.json(), {
      error: "thought must not be empty"
    });

    const longThoughtResponse = await postJson(baseUrl, "/reflect", {
      thought: createLongThought()
    });
    assert.equal(longThoughtResponse.status, 400);
    assert.deepEqual(await longThoughtResponse.json(), {
      error: "thought must be 1000 characters or fewer"
    });

    const angryThoughtResponse = await postJson(baseUrl, "/reflect", {
      thought: "I am angry and want to prove them wrong"
    });
    assert.equal(angryThoughtResponse.status, 200);
    const angryThoughtPayload = await angryThoughtResponse.json();
    assertReflectionShape(angryThoughtPayload);
    assert.equal(angryThoughtPayload.verdict, "AUTOPILOT");
    assert.equal(angryThoughtPayload.primaryPattern, "ego");
    assert.equal(angryThoughtPayload.dopamineDrain, false);

    const reelsThoughtResponse = await postJson(baseUrl, "/reflect", {
      thought: "I spent 2 hours on reels again"
    });
    assert.equal(reelsThoughtResponse.status, 200);
    const reelsThoughtPayload = await reelsThoughtResponse.json();
    assertReflectionShape(reelsThoughtPayload);
    assert.equal(reelsThoughtPayload.verdict, "AUTOPILOT");
    assert.equal(reelsThoughtPayload.primaryPattern, "fear");
    assert.equal(reelsThoughtPayload.dopamineDrain, true);

    const calmThoughtResponse = await postJson(baseUrl, "/reflect", {
      thought: "I want to respond calmly and do what is right"
    });
    assert.equal(calmThoughtResponse.status, 200);
    const calmThoughtPayload = await calmThoughtResponse.json();
    assertReflectionShape(calmThoughtPayload);
    assert.equal(calmThoughtPayload.verdict, "AUTHENTIC");
    assert.equal(calmThoughtPayload.primaryPattern, "grounded");
    assert.equal(calmThoughtPayload.dopamineDrain, false);

    const doomscrollInterceptResponse = await postJson(baseUrl, "/intercept", {
      thought: "I am doomscrolling reels again"
    });
    assert.equal(doomscrollInterceptResponse.status, 200);
    const doomscrollInterceptPayload = await doomscrollInterceptResponse.json();
    assertInterceptShape(doomscrollInterceptPayload);
    assert.equal(doomscrollInterceptPayload.shouldInterrupt, true);
    assert.equal(doomscrollInterceptPayload.reason, "passive_consumption");

    const lateNightInterceptResponse = await postJson(baseUrl, "/intercept", {
      thought: "I want to message them",
      localHour: 1
    });
    assert.equal(lateNightInterceptResponse.status, 200);
    const lateNightInterceptPayload = await lateNightInterceptResponse.json();
    assertInterceptShape(lateNightInterceptPayload);
    assert.equal(lateNightInterceptPayload.reason, "late_night_reactivity");

    const checkingInterceptResponse = await postJson(baseUrl, "/intercept", {
      thought: "I need to check if they replied again"
    });
    assert.equal(checkingInterceptResponse.status, 200);
    const checkingInterceptPayload = await checkingInterceptResponse.json();
    assertInterceptShape(checkingInterceptPayload);
    assert.equal(checkingInterceptPayload.reason, "compulsive_checking");

    const consequencePreviewResponse = await postJson(baseUrl, "/consequence-preview", {
      thought: "I am angry and want to prove them wrong"
    });
    assert.equal(consequencePreviewResponse.status, 200);
    const consequencePreviewPayload = await consequencePreviewResponse.json();
    assertConsequencePreviewShape(consequencePreviewPayload);
    assert.equal(typeof consequencePreviewPayload.autopilotOutcome, "string");
    assert.equal(typeof consequencePreviewPayload.alignedOutcome, "string");

    const calmVoiceResponse = await postJson(baseUrl, "/voice-state", {
      transcript: "I want to respond slowly and clearly."
    });
    assert.equal(calmVoiceResponse.status, 200);
    const calmVoicePayload = await calmVoiceResponse.json();
    assertVoiceStateShape(calmVoicePayload);
    assert.equal(calmVoicePayload.stateLabel, "calm");

    const defensiveVoiceResponse = await postJson(baseUrl, "/voice-state", {
      transcript: "I am fine, I just want to move on.",
      wordsPerMinute: 125,
      pauseCount: 0
    });
    assert.equal(defensiveVoiceResponse.status, 200);
    const defensiveVoicePayload = await defensiveVoiceResponse.json();
    assertVoiceStateShape(defensiveVoicePayload);
    assert.equal(defensiveVoicePayload.stateLabel, "defensive");

    const urgentVoiceResponse = await postJson(baseUrl, "/voice-state", {
      transcript: "I need to send this right now",
      wordsPerMinute: 182,
      volumeTrend: "rising"
    });
    assert.equal(urgentVoiceResponse.status, 200);
    const urgentVoicePayload = await urgentVoiceResponse.json();
    assertVoiceStateShape(urgentVoicePayload);
    assert.equal(urgentVoicePayload.stateLabel, "urgent");

    const emptyWeeklyMirrorResponse = await fetch(`${baseUrl}/weekly-mirror`, {
      headers: createHeaders(weeklySessionId)
    });
    assert.equal(emptyWeeklyMirrorResponse.status, 200);
    const emptyWeeklyMirrorPayload = await emptyWeeklyMirrorResponse.json();
    assertWeeklyMirrorShape(emptyWeeklyMirrorPayload);
    assert.equal(emptyWeeklyMirrorPayload.recoveryMetrics.totalReflections, 0);

    await postJson(
      baseUrl,
      "/reflect",
      { thought: "I spent 2 hours on reels again" },
      weeklySessionId
    );
    await postJson(
      baseUrl,
      "/reflect",
      { thought: "I feel jealous and small right now" },
      weeklySessionId
    );
    await postJson(
      baseUrl,
      "/reflect",
      { thought: "I want to respond calmly and do what is right" },
      weeklySessionId
    );

    const weeklyMirrorResponse = await fetch(`${baseUrl}/weekly-mirror`, {
      headers: createHeaders(weeklySessionId)
    });
    assert.equal(weeklyMirrorResponse.status, 200);
    const weeklyMirrorPayload = await weeklyMirrorResponse.json();
    assertWeeklyMirrorShape(weeklyMirrorPayload);
    assert.equal(weeklyMirrorPayload.dominantPattern, "fear");
    assert.equal(weeklyMirrorPayload.strongestAuthenticPattern, "grounded");
    assert.equal(weeklyMirrorPayload.recoveryMetrics.totalReflections, 3);
    assert.equal(weeklyMirrorPayload.recoveryMetrics.autopilotCount, 2);
    assert.equal(weeklyMirrorPayload.recoveryMetrics.authenticCount, 1);
    assert.equal(weeklyMirrorPayload.recoveryMetrics.dopamineDrainCount, 1);
    assert.equal(weeklyMirrorPayload.recoveryMetrics.autopilotRate, 0.67);

    console.log("Backend endpoint verification passed.");
  } finally {
    await new Promise<void>((resolve, reject) => {
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
