import { JournalRecord } from "../../lib/journalStore";

export type EmotionShapeFamily =
  | "triangle"
  | "droplet"
  | "diamond"
  | "circle"
  | "petal";

export interface EmotionCatalogItem {
  id: string;
  label: string;
  color: string;
  category: "protective" | "social" | "grounding" | "energy" | "restorative" | "expansive";
  description: string;
  distinction: string;
  shapeFamily: EmotionShapeFamily;
  defaultPattern: JournalRecord["primaryPattern"];
  defaultVerdict: JournalRecord["verdict"];
}

export const EMOTION_CATALOG: EmotionCatalogItem[] = [
  {
    id: "anxiety",
    label: "Anxiety",
    color: "#5A6F8F",
    category: "protective",
    shapeFamily: "diamond",
    description: "Your system scans for risk and seeks safety before acting.",
    distinction: "Fear often points to threat; anxiety often points to uncertainty.",
    defaultPattern: "fear",
    defaultVerdict: "AUTOPILOT"
  },
  {
    id: "helplessness",
    label: "Helplessness",
    color: "#7A8CA7",
    category: "protective",
    shapeFamily: "diamond",
    description: "Energy drops when control feels out of reach.",
    distinction: "Helplessness says 'I cannot'; fear says 'something might happen'.",
    defaultPattern: "fear",
    defaultVerdict: "AUTOPILOT"
  },
  {
    id: "fear",
    label: "Fear",
    color: "#6F7EA3",
    category: "protective",
    shapeFamily: "diamond",
    description: "A fast alarm response that wants protection now.",
    distinction: "Fear is immediate alarm; anxiety is sustained uncertainty.",
    defaultPattern: "fear",
    defaultVerdict: "AUTOPILOT"
  },
  {
    id: "anger",
    label: "Anger",
    color: "#FF6B6B",
    category: "energy",
    shapeFamily: "triangle",
    description: "Protective heat signaling crossed boundaries or pain.",
    distinction: "Anger can protect a value; hurt reveals what was impacted.",
    defaultPattern: "venting",
    defaultVerdict: "AUTOPILOT"
  },
  {
    id: "frustration",
    label: "Frustration",
    color: "#FF8B73",
    category: "energy",
    shapeFamily: "triangle",
    description: "Blocked momentum that wants movement or clarity.",
    distinction: "Frustration wants progress; anger wants boundary.",
    defaultPattern: "venting",
    defaultVerdict: "AUTOPILOT"
  },
  {
    id: "hurt",
    label: "Hurt",
    color: "#FF97A1",
    category: "social",
    shapeFamily: "droplet",
    description: "Tender pain from disconnection, rejection, or invalidation.",
    distinction: "Hurt asks for care; anger asks for boundary.",
    defaultPattern: "venting",
    defaultVerdict: "AUTOPILOT"
  },
  {
    id: "sadness",
    label: "Sadness",
    color: "#8C839C",
    category: "social",
    shapeFamily: "droplet",
    description: "A slow feeling that helps process loss or unmet hopes.",
    distinction: "Sadness softens and processes; numbness disconnects.",
    defaultPattern: "fear",
    defaultVerdict: "AUTOPILOT"
  },
  {
    id: "grief",
    label: "Grief",
    color: "#8C839C",
    category: "social",
    shapeFamily: "droplet",
    description: "A response to meaningful loss and unmet attachment.",
    distinction: "Grief honors what mattered; numbness avoids the weight.",
    defaultPattern: "fear",
    defaultVerdict: "AUTOPILOT"
  },
  {
    id: "loneliness",
    label: "Loneliness",
    color: "#B59DBD",
    category: "social",
    shapeFamily: "droplet",
    description: "The felt gap between longing for connection and current contact.",
    distinction: "Loneliness feels absence; solitude can feel chosen.",
    defaultPattern: "approval_seeking",
    defaultVerdict: "AUTOPILOT"
  },
  {
    id: "defensiveness",
    label: "Defensiveness",
    color: "#A865FF",
    category: "protective",
    shapeFamily: "triangle",
    description: "A shield response when identity or dignity feels threatened.",
    distinction: "Defensiveness protects image; groundedness protects truth.",
    defaultPattern: "ego",
    defaultVerdict: "AUTOPILOT"
  },
  {
    id: "insecurity",
    label: "Insecurity",
    color: "#D79CFF",
    category: "social",
    shapeFamily: "diamond",
    description: "A fragile sense of worth seeking reassurance.",
    distinction: "Insecurity asks 'am I enough?'; longing asks 'am I held?'.",
    defaultPattern: "approval_seeking",
    defaultVerdict: "AUTOPILOT"
  },
  {
    id: "longing",
    label: "Longing",
    color: "#E8B8FF",
    category: "social",
    shapeFamily: "petal",
    description: "A pull toward connection, belonging, or comfort.",
    distinction: "Longing reaches outward; loneliness feels the absence.",
    defaultPattern: "approval_seeking",
    defaultVerdict: "AUTOPILOT"
  },
  {
    id: "fondness",
    label: "Fondness",
    color: "#F2A7D8",
    category: "social",
    shapeFamily: "petal",
    description: "Warm connection and affectionate regard.",
    distinction: "Fondness is warm closeness; excitement is high activation.",
    defaultPattern: "intentional",
    defaultVerdict: "AUTHENTIC"
  },
  {
    id: "relief",
    label: "Relief",
    color: "#8ED5BE",
    category: "restorative",
    shapeFamily: "circle",
    description: "Pressure release after uncertainty or effort eases.",
    distinction: "Relief is decompression; calm is sustained regulation.",
    defaultPattern: "grounded",
    defaultVerdict: "AUTHENTIC"
  },
  {
    id: "resolve",
    label: "Resolve",
    color: "#34BFA3",
    category: "grounding",
    shapeFamily: "circle",
    description: "Steady commitment aligned with values.",
    distinction: "Resolve is calm direction; urgency is pressured speed.",
    defaultPattern: "intentional",
    defaultVerdict: "AUTHENTIC"
  },
  {
    id: "care",
    label: "Care",
    color: "#5DCBB5",
    category: "social",
    shapeFamily: "petal",
    description: "An orientation toward compassion and relational clarity.",
    distinction: "Care listens first; approval-seeking performs first.",
    defaultPattern: "intentional",
    defaultVerdict: "AUTHENTIC"
  },
  {
    id: "calm_clarity",
    label: "Calm Clarity",
    color: "#5B6CFF",
    category: "grounding",
    shapeFamily: "circle",
    description: "A centered state where intention stays ahead of impulse.",
    distinction: "Calm is nervous-system ease; groundedness is values-led action.",
    defaultPattern: "grounded",
    defaultVerdict: "AUTHENTIC"
  },
  {
    id: "groundedness",
    label: "Groundedness",
    color: "#7490E8",
    category: "grounding",
    shapeFamily: "circle",
    description: "Present-moment steadiness under pressure.",
    distinction: "Groundedness acts from values; composure can still be performative.",
    defaultPattern: "grounded",
    defaultVerdict: "AUTHENTIC"
  },
  {
    id: "openness",
    label: "Openness",
    color: "#87A2FF",
    category: "grounding",
    shapeFamily: "circle",
    description: "Receptive attention that allows honest reflection.",
    distinction: "Openness receives; defensiveness blocks.",
    defaultPattern: "grounded",
    defaultVerdict: "AUTHENTIC"
  },
  {
    id: "settling",
    label: "Settling",
    color: "#8EA0CC",
    category: "grounding",
    shapeFamily: "circle",
    description: "The nervous system coming down toward regulation.",
    distinction: "Settling is transition; calm is stable.",
    defaultPattern: "grounded",
    defaultVerdict: "AUTHENTIC"
  },
  {
    id: "envy",
    label: "Envy",
    color: "#A68BB2",
    category: "social",
    shapeFamily: "diamond",
    description: "Painful comparison signaling a need that feels distant.",
    distinction: "Envy says 'I also want'; shame says 'I am less'.",
    defaultPattern: "fear",
    defaultVerdict: "AUTOPILOT"
  },
  {
    id: "excitement",
    label: "Excitement",
    color: "#F7A55C",
    category: "expansive",
    shapeFamily: "circle",
    description: "High positive activation that can energize action.",
    distinction: "Excitement is energized; joy can be quiet or loud.",
    defaultPattern: "intentional",
    defaultVerdict: "AUTHENTIC"
  },
  {
    id: "gratitude",
    label: "Gratitude",
    color: "#B4C86D",
    category: "restorative",
    shapeFamily: "circle",
    description: "A settling appreciation for support, effort, or grace.",
    distinction: "Gratitude receives what is present; ambition pursues what is next.",
    defaultPattern: "grounded",
    defaultVerdict: "AUTHENTIC"
  },
  {
    id: "numbness",
    label: "Numbness",
    color: "#788090",
    category: "protective",
    shapeFamily: "diamond",
    description: "Protective shutdown when the system cannot process more.",
    distinction: "Numbness disconnects from feeling; calm remains connected.",
    defaultPattern: "fear",
    defaultVerdict: "AUTOPILOT"
  },
  {
    id: "shame",
    label: "Shame",
    color: "#9C7F98",
    category: "social",
    shapeFamily: "droplet",
    description: "A collapse around identity and belonging after perceived failure.",
    distinction: "Shame says 'I am bad'; guilt says 'I did something wrong'.",
    defaultPattern: "approval_seeking",
    defaultVerdict: "AUTOPILOT"
  },
  {
    id: "hope",
    label: "Hope",
    color: "#6AB7B0",
    category: "expansive",
    shapeFamily: "circle",
    description: "Forward-leaning trust that change is possible.",
    distinction: "Hope allows uncertainty; certainty denies it.",
    defaultPattern: "intentional",
    defaultVerdict: "AUTHENTIC"
  }
];

export interface EmotionDiscovery {
  discovered: EmotionCatalogItem[];
  hidden: EmotionCatalogItem[];
}

function normalizeEmotion(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

export function getEmotionCatalogItem(id: string) {
  return EMOTION_CATALOG.find((item) => item.id === id);
}

export function getEmotionShapeFamily(emotionLabel: string): EmotionShapeFamily {
  const normalized = normalizeEmotion(emotionLabel);
  const catalogMatch = EMOTION_CATALOG.find((item) => {
    return item.id === normalized || normalizeEmotion(item.label) === normalized;
  });

  if (catalogMatch) {
    return catalogMatch.shapeFamily;
  }

  if (normalized.includes("anger") || normalized.includes("frustrat") || normalized.includes("defens")) {
    return "triangle";
  }

  if (
    normalized.includes("fear") ||
    normalized.includes("anx") ||
    normalized.includes("insecur") ||
    normalized.includes("numb")
  ) {
    return "diamond";
  }

  if (
    normalized.includes("sad") ||
    normalized.includes("grief") ||
    normalized.includes("hurt") ||
    normalized.includes("lonely")
  ) {
    return "droplet";
  }

  if (normalized.includes("love") || normalized.includes("care") || normalized.includes("long")) {
    return "petal";
  }

  return "circle";
}

export function getEmotionDiscovery(entries: JournalRecord[]): EmotionDiscovery {
  const seenEmotionIds = new Set<string>();

  entries.forEach((entry) => {
    const primary = normalizeEmotion(entry.emotionProfile.primaryEmotion);
    const secondary = normalizeEmotion(entry.emotionProfile.secondaryEmotion);

    EMOTION_CATALOG.forEach((item) => {
      if (item.id === primary || item.id === secondary || normalizeEmotion(item.label) === primary) {
        seenEmotionIds.add(item.id);
      }
    });
  });

  return EMOTION_CATALOG.reduce<EmotionDiscovery>(
    (accumulator, item) => {
      if (seenEmotionIds.has(item.id)) {
        accumulator.discovered.push(item);
      } else {
        accumulator.hidden.push(item);
      }

      return accumulator;
    },
    {
      discovered: [],
      hidden: []
    }
  );
}
