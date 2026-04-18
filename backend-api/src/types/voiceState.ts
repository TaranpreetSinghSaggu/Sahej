export type VoiceStateLabel = "calm" | "defensive" | "urgent";
export type ToneSignal = "steady" | "guarded" | "activated";
export type VolumeTrend = "rising" | "steady" | "falling";

export interface VoiceStateRequestBody {
  transcript?: unknown;
  wordsPerMinute?: unknown;
  pauseCount?: unknown;
  volumeTrend?: unknown;
}

export interface VoiceStateResult {
  stateLabel: VoiceStateLabel;
  toneSignal: ToneSignal;
  mirrorLine: string;
  nextStepPrompt: string;
}

export const VOLUME_TRENDS: readonly VolumeTrend[] = ["rising", "steady", "falling"];
