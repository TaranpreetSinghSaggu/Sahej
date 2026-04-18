import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";

import app from "./app";
import { ReflectionResult } from "./types/reflection";

const REFLECTION_KEYS: Array<keyof ReflectionResult> = [
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
  const record = payload as Record<string, unknown>;

  assertExactObjectKeys(record.emotionProfile, EMOTION_PROFILE_KEYS);
  assertExactObjectKeys(record.journalEntry, JOURNAL_ENTRY_KEYS);
  assert.match((record.emotionProfile as Record<string, unknown>).bodyColor as string, /^#[0-9A-F]{6}$/i);
}

const main = async () => {
  const server = app.listen(0);

  try {
    await once(server, "listening");

    const address = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${address.port}`;

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

    console.log("Reflect endpoint verification passed.");
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
  console.error("Reflect endpoint verification failed.");
  console.error(error);
  process.exitCode = 1;
});
