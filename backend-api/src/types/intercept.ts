export type InterceptReason =
  | "late_night_reactivity"
  | "compulsive_checking"
  | "passive_consumption"
  | "rapid_reactivity"
  | "steady";

export type InterceptUrgeLabel =
  | "seeking_relief"
  | "seeking_control"
  | "seeking_validation"
  | "avoiding_discomfort";

export interface InterceptRequestBody {
  thought?: unknown;
  openedCount5m?: unknown;
  localHour?: unknown;
  typingBurst?: unknown;
}

export interface InterceptResult {
  shouldInterrupt: boolean;
  reason: InterceptReason;
  urgeLabels: InterceptUrgeLabel[];
  promptLine: string;
}
