import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const HEARTBEAT_INTERVAL_MS = 760;
const SECOND_PULSE_DELAY_MS = 170;
const HEARTBEAT_DURATION_MS = 5_000;
const LOG_PREFIX = "[sahej:haptics]";

interface StartCalmHeartbeatOptions {
  durationMs?: number;
  intervalMs?: number;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function startCalmHeartbeat(options?: StartCalmHeartbeatOptions) {
  const durationMs = options?.durationMs ?? HEARTBEAT_DURATION_MS;
  const intervalMs = options?.intervalMs ?? HEARTBEAT_INTERVAL_MS;
  let isCancelled = false;
  let loopTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let secondPulseTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let stopTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const triggerPulse = async (style: Haptics.ImpactFeedbackStyle) => {
    if (isCancelled) {
      return;
    }

    try {
      if (Platform.OS === "android") {
        const androidType =
          style === Haptics.ImpactFeedbackStyle.Medium
            ? Haptics.AndroidHaptics.Context_Click
            : Haptics.AndroidHaptics.Clock_Tick;
        await Haptics.performAndroidHapticsAsync(androidType);
        return;
      }

      await Haptics.impactAsync(style);
    } catch {
      // Haptics are optional in the hackathon demo flow.
    }
  };

  const clearTimers = () => {
    if (loopTimeoutId) {
      clearTimeout(loopTimeoutId);
      loopTimeoutId = null;
    }

    if (secondPulseTimeoutId) {
      clearTimeout(secondPulseTimeoutId);
      secondPulseTimeoutId = null;
    }

    if (stopTimeoutId) {
      clearTimeout(stopTimeoutId);
      stopTimeoutId = null;
    }
  };

  const runHeartbeat = () => {
    if (isCancelled) {
      return;
    }

    void triggerPulse(Haptics.ImpactFeedbackStyle.Light);

    secondPulseTimeoutId = setTimeout(() => {
      void triggerPulse(Haptics.ImpactFeedbackStyle.Medium);
    }, SECOND_PULSE_DELAY_MS);

    loopTimeoutId = setTimeout(runHeartbeat, intervalMs);
  };

  console.log(`${LOG_PREFIX} calm heartbeat start`);

  void (async () => {
    await wait(40);
    runHeartbeat();
  })();

  stopTimeoutId = setTimeout(() => {
    isCancelled = true;
    clearTimers();
    console.log(`${LOG_PREFIX} calm heartbeat stop (duration complete)`);
  }, durationMs);

  return () => {
    isCancelled = true;
    clearTimers();
    console.log(`${LOG_PREFIX} calm heartbeat stop (cleanup)`);
  };
}
