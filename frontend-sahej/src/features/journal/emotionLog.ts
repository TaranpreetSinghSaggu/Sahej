import { JournalRecord } from "../../lib/journalStore";
import { EmotionCatalogItem } from "./emotionCatalog";

interface BuildEmotionLogEntryInput {
  emotion: EmotionCatalogItem;
  intensity?: 1 | 2 | 3 | 4 | 5;
  note?: string;
}

export function buildEmotionLogEntry({
  emotion,
  intensity = 3,
  note
}: BuildEmotionLogEntryInput): Omit<JournalRecord, "id" | "timestamp"> {
  const trimmedNote = note?.trim() ?? "";
  const isAutopilot = emotion.defaultVerdict === "AUTOPILOT";

  return {
    source: "emotion_log",
    originalThought: trimmedNote || `Feeling log: ${emotion.label}`,
    verdict: emotion.defaultVerdict,
    primaryPattern: emotion.defaultPattern,
    intensity,
    mirrorLine: isAutopilot
      ? `${emotion.label} is present. Naming it now creates space before reaction.`
      : `${emotion.label} is present. Staying with it can strengthen your next choice.`,
    reframePrompt: isAutopilot
      ? `Pause for one breath and ask what ${emotion.description.toLowerCase()} is protecting.`
      : `Carry this ${emotion.label.toLowerCase()} energy into one intentional next action.`,
    dopamineDrain: isAutopilot && intensity >= 4,
    emotionProfile: {
      primaryEmotion: emotion.label.toLowerCase(),
      secondaryEmotion: trimmedNote ? "self-awareness" : "unspoken",
      underlyingNeed: emotion.defaultPattern === "grounded" ? "truth" : "safety",
      bodyColor: emotion.color,
      colorName: emotion.label,
      explanation: emotion.description
    },
    journalEntry: {
      summary:
        trimmedNote || `I logged ${emotion.label.toLowerCase()} to notice it before autopilot.`,
      awarenessPrompt: "What would help this feeling settle without suppressing it?"
    }
  };
}
