import * as Haptics from "expo-haptics";

import { ReflectionVerdict } from "../reflection/types";

export async function triggerReflectionHaptic(verdict: ReflectionVerdict) {
  try {
    if (verdict === "AUTOPILOT") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics are optional in the hackathon demo flow.
  }
}
