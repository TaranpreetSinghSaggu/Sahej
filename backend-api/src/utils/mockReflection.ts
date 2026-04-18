import {
  EmotionProfile,
  JournalEntry,
  ReflectionPattern,
  ReflectionResult,
  ReflectionVerdict
} from "../types/reflection";

interface ReflectionTemplate {
  verdict: ReflectionVerdict;
  primaryPattern: ReflectionPattern;
  intensity: ReflectionResult["intensity"];
  dopamineDrain: boolean;
  mirrorLine: string;
  reframePrompt: string;
  emotionProfile: EmotionProfile;
  journalEntry: JournalEntry;
}

const ANGRY_KEYWORDS = [
  "angry",
  "hate",
  "prove",
  "revenge",
  "show them",
  "wrong",
  "fight",
  "furious",
  "rage"
];

const DOOMSCROLL_KEYWORDS = [
  "reels",
  "shorts",
  "doomscroll",
  "doom scroll",
  "scrolling",
  "youtube all day",
  "instagram all day",
  "tiktok all day"
];

const FEAR_KEYWORDS = [
  "scared",
  "anxious",
  "overwhelmed",
  "nervous",
  "panic",
  "exam",
  "interview"
];

const HURT_KEYWORDS = [
  "hurt",
  "lonely",
  "rejected",
  "sad",
  "left out",
  "miss them",
  "miss her",
  "miss him",
  "alone"
];

const GROUNDED_KEYWORDS = [
  "calm",
  "grounded",
  "peaceful",
  "respond gently",
  "intentional",
  "grateful",
  "clear"
];

const RELIEF_KEYWORDS = [
  "relieved",
  "done",
  "finished",
  "finally",
  "completed",
  "complete"
];

const APPROVAL_KEYWORDS = ["validation", "likes", "approval", "seen", "accepted"];

const includesAny = (thought: string, keywords: string[]) =>
  keywords.some((keyword) => thought.includes(keyword));

const EGO_REACTIVE_TEMPLATE: ReflectionTemplate = {
  verdict: "AUTOPILOT",
  primaryPattern: "ego",
  intensity: 5,
  dopamineDrain: false,
  mirrorLine:
    "This thought carries a protective edge where proving yourself feels safer than pausing.",
  reframePrompt:
    "Take one slow breath and name the boundary you need without trying to win the moment.",
  emotionProfile: {
    primaryEmotion: "anger",
    secondaryEmotion: "hurt",
    underlyingNeed: "respect",
    bodyColor: "#C62828",
    colorName: "crimson heat",
    explanation:
      "The force in your tone suggests pain is being defended through intensity."
  },
  journalEntry: {
    summary: "I noticed a reactive surge where respect felt threatened.",
    awarenessPrompt: "What sentence protects my dignity without escalation?"
  }
};

const VENTING_TEMPLATE: ReflectionTemplate = {
  verdict: "AUTOPILOT",
  primaryPattern: "venting",
  intensity: 4,
  dopamineDrain: false,
  mirrorLine:
    "You sound emotionally flooded, and the body is asking to release pressure fast.",
  reframePrompt:
    "Pause for 90 seconds, then rewrite your response as one truth and one need.",
  emotionProfile: {
    primaryEmotion: "anger",
    secondaryEmotion: "hurt",
    underlyingNeed: "relief",
    bodyColor: "#D84315",
    colorName: "volcanic orange",
    explanation:
      "Venting often appears when pain is real but language is running ahead of regulation."
  },
  journalEntry: {
    summary: "I felt pressure to discharge emotion quickly.",
    awarenessPrompt: "Can I let the heat settle before I speak?"
  }
};

const DOOMSCROLL_TEMPLATE: ReflectionTemplate = {
  verdict: "AUTOPILOT",
  primaryPattern: "fear",
  intensity: 4,
  dopamineDrain: true,
  mirrorLine:
    "The scroll loop looks like overstimulation trying to numb a deeper unease.",
  reframePrompt:
    "Close the feed, put the phone down for two minutes, and let your breath slow first.",
  emotionProfile: {
    primaryEmotion: "numbness",
    secondaryEmotion: "anxiety",
    underlyingNeed: "regulation",
    bodyColor: "#7A7F87",
    colorName: "washed gray",
    explanation:
      "Passive stimulation can mimic rest while actually draining attention and emotional clarity."
  },
  journalEntry: {
    summary: "I was consuming to cope, but it deepened fatigue.",
    awarenessPrompt: "What real reset can I choose instead of one more scroll?"
  }
};

const FEAR_TEMPLATE: ReflectionTemplate = {
  verdict: "AUTOPILOT",
  primaryPattern: "fear",
  intensity: 4,
  dopamineDrain: false,
  mirrorLine:
    "Your system is scanning for risk, which is making the moment feel bigger than it is.",
  reframePrompt:
    "Ground your body first, then choose one small next step you can control.",
  emotionProfile: {
    primaryEmotion: "anxiety",
    secondaryEmotion: "insecurity",
    underlyingNeed: "safety",
    bodyColor: "#4E6B8A",
    colorName: "storm blue",
    explanation:
      "Overwhelm often means your nervous system needs safety cues before problem-solving."
  },
  journalEntry: {
    summary: "I noticed fear trying to drive urgency.",
    awarenessPrompt: "What is the smallest stable action available now?"
  }
};

const HURT_TEMPLATE: ReflectionTemplate = {
  verdict: "AUTOPILOT",
  primaryPattern: "fear",
  intensity: 3,
  dopamineDrain: false,
  mirrorLine:
    "There is sadness here beneath the words, asking for connection rather than performance.",
  reframePrompt:
    "Name what you miss directly, then choose one gentle reach-out or self-care step.",
  emotionProfile: {
    primaryEmotion: "sadness",
    secondaryEmotion: "hurt",
    underlyingNeed: "connection",
    bodyColor: "#6D6FA5",
    colorName: "indigo dusk",
    explanation:
      "Loneliness and rejection pain soften when they are acknowledged without self-judgment."
  },
  journalEntry: {
    summary: "I felt emotionally tender and disconnected.",
    awarenessPrompt: "What would safe connection look like right now?"
  }
};

const APPROVAL_TEMPLATE: ReflectionTemplate = {
  verdict: "AUTOPILOT",
  primaryPattern: "approval_seeking",
  intensity: 3,
  dopamineDrain: false,
  mirrorLine:
    "This sounds like a search for reassurance outside when worth feels unstable inside.",
  reframePrompt:
    "Offer yourself one validating sentence before checking anyone else's reaction.",
  emotionProfile: {
    primaryEmotion: "insecurity",
    secondaryEmotion: "longing",
    underlyingNeed: "belonging",
    bodyColor: "#B794F6",
    colorName: "soft violet",
    explanation:
      "Approval-seeking rises when belonging feels conditional in the mind."
  },
  journalEntry: {
    summary: "I was trying to feel enough through external signals.",
    awarenessPrompt: "How can I anchor worth internally first?"
  }
};

const GROUNDED_TEMPLATE: ReflectionTemplate = {
  verdict: "AUTHENTIC",
  primaryPattern: "grounded",
  intensity: 2,
  dopamineDrain: false,
  mirrorLine:
    "You sound regulated and intentional enough to choose a clean response.",
  reframePrompt:
    "Keep this steady tone and take one action aligned with your values.",
  emotionProfile: {
    primaryEmotion: "calm",
    secondaryEmotion: "clarity",
    underlyingNeed: "peace",
    bodyColor: "#4F6BED",
    colorName: "steady indigo",
    explanation:
      "Your language shows emotional space between feeling and action, which supports wise decisions."
  },
  journalEntry: {
    summary: "I felt centered enough to respond with intention.",
    awarenessPrompt: "What choice keeps me aligned with peace and truth?"
  }
};

const INTENTIONAL_TEMPLATE: ReflectionTemplate = {
  verdict: "AUTHENTIC",
  primaryPattern: "intentional",
  intensity: 3,
  dopamineDrain: false,
  mirrorLine:
    "There is deliberate care in this thought, which suggests your values are leading.",
  reframePrompt:
    "Translate this intention into one specific, kind, and truthful next step.",
  emotionProfile: {
    primaryEmotion: "gratitude",
    secondaryEmotion: "clarity",
    underlyingNeed: "alignment",
    bodyColor: "#2E9E8A",
    colorName: "deep jade",
    explanation:
      "Intentional language usually reflects healthy regulation and self-leadership."
  },
  journalEntry: {
    summary: "I noticed intention instead of impulse in my response.",
    awarenessPrompt: "How do I keep this integrity in the next decision?"
  }
};

const RELIEF_TEMPLATE: ReflectionTemplate = {
  verdict: "AUTHENTIC",
  primaryPattern: "grounded",
  intensity: 2,
  dopamineDrain: false,
  mirrorLine:
    "Relief is present, and your system is settling after sustained pressure.",
  reframePrompt:
    "Let this completion land for a moment, then choose one calm closure action.",
  emotionProfile: {
    primaryEmotion: "relief",
    secondaryEmotion: "calm",
    underlyingNeed: "rest",
    bodyColor: "#4DB6AC",
    colorName: "cool teal",
    explanation:
      "Completion can restore regulation when you allow yourself to fully register progress."
  },
  journalEntry: {
    summary: "I felt the pressure drop after finishing something important.",
    awarenessPrompt: "What recovery step helps me protect this calm?"
  }
};

const DEFAULT_NEUTRAL_TEMPLATE: ReflectionTemplate = {
  verdict: "AUTHENTIC",
  primaryPattern: "grounded",
  intensity: 2,
  dopamineDrain: false,
  mirrorLine:
    "You are in a workable state to pause, observe, and choose intentionally.",
  reframePrompt:
    "Take one breath, name your intention, and move with clarity.",
  emotionProfile: {
    primaryEmotion: "settling",
    secondaryEmotion: "openness",
    underlyingNeed: "clarity",
    bodyColor: "#6C7BA8",
    colorName: "slate indigo",
    explanation:
      "When signals are mixed, a grounded neutral stance helps prevent reactive decisions."
  },
  journalEntry: {
    summary: "I paused in a neutral zone before acting.",
    awarenessPrompt: "What intentional choice would future-me respect?"
  }
};

function createReflectionFromTemplate(template: ReflectionTemplate): ReflectionResult {
  return {
    verdict: template.verdict,
    primaryPattern: template.primaryPattern,
    intensity: template.intensity,
    mirrorLine: template.mirrorLine,
    reframePrompt: template.reframePrompt,
    dopamineDrain: template.dopamineDrain,
    emotionProfile: template.emotionProfile,
    journalEntry: template.journalEntry
  };
}

// Demo input examples:
// - "I am angry and want to prove them wrong"
// - "I spent 2 hours on reels again"
// - "I feel anxious about my interview"
// - "I miss them and feel lonely"
// - "I want to respond calmly and do the right thing"
// - "I finally finished my work and feel relieved"
export const createMockReflection = (normalizedThought: string): ReflectionResult => {
  if (includesAny(normalizedThought, DOOMSCROLL_KEYWORDS)) {
    return createReflectionFromTemplate(DOOMSCROLL_TEMPLATE);
  }

  if (includesAny(normalizedThought, RELIEF_KEYWORDS)) {
    return createReflectionFromTemplate(RELIEF_TEMPLATE);
  }

  if (includesAny(normalizedThought, ANGRY_KEYWORDS)) {
    const egoIntent =
      normalizedThought.includes("prove") ||
      normalizedThought.includes("show them") ||
      normalizedThought.includes("wrong") ||
      normalizedThought.includes("revenge");

    return createReflectionFromTemplate(egoIntent ? EGO_REACTIVE_TEMPLATE : VENTING_TEMPLATE);
  }

  if (includesAny(normalizedThought, FEAR_KEYWORDS)) {
    return createReflectionFromTemplate(FEAR_TEMPLATE);
  }

  if (includesAny(normalizedThought, HURT_KEYWORDS)) {
    return createReflectionFromTemplate(HURT_TEMPLATE);
  }

  if (includesAny(normalizedThought, APPROVAL_KEYWORDS)) {
    return createReflectionFromTemplate(APPROVAL_TEMPLATE);
  }

  if (includesAny(normalizedThought, GROUNDED_KEYWORDS)) {
    const intentionalIntent =
      normalizedThought.includes("intentional") ||
      normalizedThought.includes("respond gently") ||
      normalizedThought.includes("grateful");

    return createReflectionFromTemplate(intentionalIntent ? INTENTIONAL_TEMPLATE : GROUNDED_TEMPLATE);
  }

  return createReflectionFromTemplate(DEFAULT_NEUTRAL_TEMPLATE);
};
