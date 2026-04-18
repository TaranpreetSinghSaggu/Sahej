import { JournalRecord } from "../../lib/journalStore";

export interface JournalSummary {
  topEmotion: string;
  topPattern: string;
}

function getMostFrequent(values: string[], fallback: string) {
  if (values.length === 0) {
    return fallback;
  }

  const counts = new Map<string, number>();

  values.forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  let selectedValue = fallback;
  let maxCount = 0;

  counts.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count;
      selectedValue = value;
    }
  });

  return selectedValue;
}

export function buildJournalSummary(entries: JournalRecord[]): JournalSummary {
  return {
    topEmotion: getMostFrequent(entries.map((entry) => entry.emotionProfile.primaryEmotion), "None yet"),
    topPattern: getMostFrequent(entries.map((entry) => entry.primaryPattern), "None yet")
  };
}
