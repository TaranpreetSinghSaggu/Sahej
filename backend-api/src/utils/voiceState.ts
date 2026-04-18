import { VoiceStateResult, VolumeTrend } from "../types/voiceState";

interface SpeechMeta {
  wordsPerMinute?: number;
  pauseCount?: number;
  volumeTrend?: VolumeTrend;
}

const URGENT_TERMS = ["angry", "hate", "need", "now", "immediately"];
const DEFENSIVE_TERMS = ["fine", "just", "whatever"];

const includesAny = (value: string, terms: string[]) =>
  terms.some((term) => value.includes(term));

export const analyzeVoiceState = (
  transcript: string,
  speechMeta: SpeechMeta
): VoiceStateResult => {
  const normalizedTranscript = transcript.trim().toLowerCase();

  if (
    includesAny(normalizedTranscript, URGENT_TERMS) ||
    (speechMeta.wordsPerMinute ?? 0) >= 170 ||
    speechMeta.volumeTrend === "rising"
  ) {
    return {
      stateLabel: "urgent",
      toneSignal: "activated",
      mirrorLine: "Your tone is moving faster than your clarity.",
      nextStepPrompt: "Pause before you speak from this speed."
    };
  }

  if (
    includesAny(normalizedTranscript, DEFENSIVE_TERMS) ||
    ((speechMeta.pauseCount ?? 1) === 0 && (speechMeta.wordsPerMinute ?? 0) >= 120)
  ) {
    return {
      stateLabel: "defensive",
      toneSignal: "guarded",
      mirrorLine: "Your words sound contained, but your guard is still up.",
      nextStepPrompt: "Name what you are protecting before you respond."
    };
  }

  return {
    stateLabel: "calm",
    toneSignal: "steady",
    mirrorLine: "Your tone sounds steadier and more available to choice.",
    nextStepPrompt: "Take the next step slowly and clearly."
  };
};
