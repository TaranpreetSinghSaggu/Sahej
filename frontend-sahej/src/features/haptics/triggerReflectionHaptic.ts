import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ReflectionResult } from "../reflection/types";

const HIGH_REACTIVITY_EMOTIONS = [
  "anger",
  "rage",
  "frustration",
  "frustrated",
  "anxiety",
  "panic",
  "fear",
  "hurt"
];
const CALM_EMOTIONS = ["calm", "grounded", "settling", "openness", "care", "resolve", "clarity"];
const LOG_PREFIX = "[sahej:haptics]";

function includesEmotion(target: string, candidates: string[]) {
  const normalizedTarget = target.toLowerCase();
  return candidates.some((candidate) => normalizedTarget.includes(candidate));
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function logHaptic(message: string) {
  console.log(`${LOG_PREFIX} ${message}`);
}

async function playImpact(
  iosStyle: Haptics.ImpactFeedbackStyle,
  androidType: Haptics.AndroidHaptics
) {
  if (Platform.OS === "android") {
    await Haptics.performAndroidHapticsAsync(androidType);
    return;
  }

  await Haptics.impactAsync(iosStyle);
}

async function playNotification(
  iosType: Haptics.NotificationFeedbackType,
  androidType: Haptics.AndroidHaptics
) {
  if (Platform.OS === "android") {
    await Haptics.performAndroidHapticsAsync(androidType);
    return;
  }

  await Haptics.notificationAsync(iosType);
}

async function playStrongAutopilotPattern() {
  await playNotification(Haptics.NotificationFeedbackType.Warning, Haptics.AndroidHaptics.Reject);
  await wait(80);
  await playImpact(Haptics.ImpactFeedbackStyle.Heavy, Haptics.AndroidHaptics.Long_Press);
  await wait(90);
  await playImpact(Haptics.ImpactFeedbackStyle.Rigid, Haptics.AndroidHaptics.Reject);
}

async function playMediumAutopilotPattern() {
  await playNotification(Haptics.NotificationFeedbackType.Warning, Haptics.AndroidHaptics.Reject);
  await wait(70);
  await playImpact(Haptics.ImpactFeedbackStyle.Medium, Haptics.AndroidHaptics.Context_Click);
}

async function playLightAuthenticPattern() {
  await playImpact(Haptics.ImpactFeedbackStyle.Light, Haptics.AndroidHaptics.Confirm);
  await wait(45);
  await playImpact(Haptics.ImpactFeedbackStyle.Soft, Haptics.AndroidHaptics.Segment_Tick);
}

export async function triggerReflectionHaptic(result: ReflectionResult) {
  try {
    const primaryEmotion = `${result.emotionProfile.primaryEmotion} ${result.primaryPattern}`.toLowerCase();
    const isHighReactivity =
      result.verdict === "AUTOPILOT" &&
      (result.intensity >= 4 || includesEmotion(primaryEmotion, HIGH_REACTIVITY_EMOTIONS));

    const isCalmAuthentic =
      result.verdict === "AUTHENTIC" &&
      (result.intensity <= 3 || includesEmotion(primaryEmotion, CALM_EMOTIONS));

    if (isHighReactivity) {
      logHaptic("trigger strong result haptic");
      await playStrongAutopilotPattern();
      return;
    }

    if (result.verdict === "AUTOPILOT") {
      logHaptic("trigger medium result haptic");
      await playMediumAutopilotPattern();
      return;
    }

    if (isCalmAuthentic) {
      logHaptic("trigger light result haptic");
      await playLightAuthenticPattern();
      return;
    }

    logHaptic("trigger light result haptic (default authentic)");
    await playLightAuthenticPattern();
  } catch {
    // Haptics are optional in the hackathon demo flow.
  }
}
