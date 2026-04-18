import AsyncStorage from "@react-native-async-storage/async-storage";

import { getEmotionCatalogItem } from "../features/journal/emotionCatalog";
import { buildEmotionLogEntry } from "../features/journal/emotionLog";
import { clearNotes, NOTES_STORAGE_KEY, replaceNotes } from "../features/notes/store";
import { NoteRecord } from "../features/notes/types";
import { ReflectionResult } from "../features/reflection/types";
import {
  clearJournalEntries,
  JOURNAL_STORAGE_KEY,
  JournalRecord,
  replaceJournalEntries
} from "./journalStore";
import { clearLatestReflection } from "./latestReflection";

const DEMO_SEED_FLAG_KEY = "sahej-demo-seed-v1";
const POSSIBLE_UNLOCK_KEYS = [
  "sahej-emotion-unlocks",
  "sahej-emotion-unlocks-v1",
  "sahej-discovered-emotions",
  "sahej-emotion-discovery"
];

interface ReflectionSeed {
  id: string;
  daysAgo: number;
  hour: number;
  minute: number;
  thought: string;
  result: ReflectionResult;
}

interface EmotionLogSeed {
  id: string;
  emotionId: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  note: string;
  daysAgo: number;
  hour: number;
  minute: number;
}

interface NoteSeed {
  id: string;
  title: string;
  body: string;
  tags: string[];
  linkedReflectionId?: string;
  daysAgo: number;
  hour: number;
  minute: number;
  updatedShiftMinutes?: number;
}

function timestampFrom(daysAgo: number, hour: number, minute: number) {
  const date = new Date();
  date.setSeconds(0, 0);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

const REFLECTION_SEEDS: ReflectionSeed[] = [
  // 1) Conflict / anger / ego-defense arc
  {
    id: "seed-r-01",
    daysAgo: 11,
    hour: 22,
    minute: 18,
    thought: "I am angry and want to prove them wrong in the team chat.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "ego",
      intensity: 5,
      mirrorLine: "This reaction is trying to protect dignity by winning quickly.",
      reframePrompt: "Name the hurt first, then state one clean boundary.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "anger",
        secondaryEmotion: "hurt",
        underlyingNeed: "respect",
        bodyColor: "#D53A3A",
        colorName: "charged crimson",
        explanation: "Heat is high because pain and pride are fused together."
      },
      journalEntry: {
        summary: "I wanted to dominate the conversation because I felt disrespected.",
        awarenessPrompt: "What would assertive clarity look like without attack?"
      }
    }
  },
  {
    id: "seed-r-02",
    daysAgo: 11,
    hour: 9,
    minute: 14,
    thought: "I keep replaying that argument and imagining a revenge reply.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "ego",
      intensity: 4,
      mirrorLine: "The mind is rehearsing control to avoid feeling small again.",
      reframePrompt: "Write the unsent message, then pull out one boundary sentence.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "defensiveness",
        secondaryEmotion: "anger",
        underlyingNeed: "respect",
        bodyColor: "#A865FF",
        colorName: "protective violet",
        explanation: "Defensiveness is stepping in so vulnerability stays hidden."
      },
      journalEntry: {
        summary: "I noticed revenge fantasies were covering shame and hurt.",
        awarenessPrompt: "What am I trying to protect beneath this armor?"
      }
    }
  },
  {
    id: "seed-r-03",
    daysAgo: 10,
    hour: 19,
    minute: 5,
    thought: "I snapped at my friend over something small.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "venting",
      intensity: 4,
      mirrorLine: "The reaction carried old pressure, not just this moment.",
      reframePrompt: "Pause and apologize for tone before explaining your need.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "frustration",
        secondaryEmotion: "hurt",
        underlyingNeed: "care",
        bodyColor: "#FF8B73",
        colorName: "heated coral",
        explanation: "Irritation rose because emotional bandwidth was already low."
      },
      journalEntry: {
        summary: "I vented because accumulated stress leaked into a safe relationship.",
        awarenessPrompt: "How can I repair quickly and gently?"
      }
    }
  },
  {
    id: "seed-r-04",
    daysAgo: 10,
    hour: 8,
    minute: 50,
    thought: "My body gets tight whenever feedback comes in.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "fear",
      intensity: 3,
      mirrorLine: "The body braces as if feedback equals threat.",
      reframePrompt: "Take one exhale before reading and extract one useful point.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "fear",
        secondaryEmotion: "insecurity",
        underlyingNeed: "safety",
        bodyColor: "#6F7EA3",
        colorName: "cool steel",
        explanation: "Threat sensitivity rises when identity feels exposed."
      },
      journalEntry: {
        summary: "I recognized my feedback fear before reacting defensively.",
        awarenessPrompt: "What part of this feedback is information, not identity?"
      }
    }
  },
  {
    id: "seed-r-05",
    daysAgo: 9,
    hour: 21,
    minute: 12,
    thought: "Under the anger I feel deeply hurt and unseen.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "venting",
      intensity: 3,
      mirrorLine: "The anger softens when the hurt is named directly.",
      reframePrompt: "Express the impact sentence before the blame sentence.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "hurt",
        secondaryEmotion: "sadness",
        underlyingNeed: "connection",
        bodyColor: "#B48BA0",
        colorName: "dusky rose",
        explanation: "Naming pain reduces the need for aggressive protection."
      },
      journalEntry: {
        summary: "I found sadness beneath my sharp tone.",
        awarenessPrompt: "Can I ask to be understood without attacking?"
      }
    }
  },
  {
    id: "seed-r-06",
    daysAgo: 9,
    hour: 7,
    minute: 44,
    thought: "I want to repair this conflict with clarity and care.",
    result: {
      verdict: "AUTHENTIC",
      primaryPattern: "intentional",
      intensity: 2,
      mirrorLine: "Repair is possible because your intention is stable.",
      reframePrompt: "Lead with accountability, then ask for a reset.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "resolve",
        secondaryEmotion: "care",
        underlyingNeed: "alignment",
        bodyColor: "#34BFA3",
        colorName: "deep teal",
        explanation: "You are choosing values over ego speed."
      },
      journalEntry: {
        summary: "I moved from argument energy into repair energy.",
        awarenessPrompt: "What first line keeps both dignity and warmth?"
      }
    }
  },

  // 2) Doomscroll / numbness / overstimulation arc
  {
    id: "seed-r-07",
    daysAgo: 8,
    hour: 0,
    minute: 35,
    thought: "I lost two hours on reels again and now feel hollow.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "fear",
      intensity: 4,
      mirrorLine: "The scroll loop looked like relief but amplified depletion.",
      reframePrompt: "End the feed now and take a 2-minute body reset.",
      dopamineDrain: true,
      emotionProfile: {
        primaryEmotion: "numbness",
        secondaryEmotion: "anxiety",
        underlyingNeed: "rest",
        bodyColor: "#788090",
        colorName: "drained slate",
        explanation: "Overstimulation numbs first and exhausts later."
      },
      journalEntry: {
        summary: "I mistook scrolling for recovery.",
        awarenessPrompt: "What kind of rest leaves me clearer, not emptier?"
      }
    }
  },
  {
    id: "seed-r-08",
    daysAgo: 8,
    hour: 13,
    minute: 28,
    thought: "I keep opening shorts whenever work feels heavy.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "fear",
      intensity: 3,
      mirrorLine: "Avoidance is appearing as micro-escapes from pressure.",
      reframePrompt: "Do one 8-minute focus sprint before opening any app.",
      dopamineDrain: true,
      emotionProfile: {
        primaryEmotion: "anxiety",
        secondaryEmotion: "numbness",
        underlyingNeed: "safety",
        bodyColor: "#5A6F8F",
        colorName: "storm slate",
        explanation: "The brain seeks fast comfort when challenge feels threatening."
      },
      journalEntry: {
        summary: "My avoidance pattern showed up as short-form consumption.",
        awarenessPrompt: "What tiny action would reduce this pressure honestly?"
      }
    }
  },
  {
    id: "seed-r-09",
    daysAgo: 7,
    hour: 23,
    minute: 7,
    thought: "Instagram all day and now my head feels noisy and dull.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "approval_seeking",
      intensity: 4,
      mirrorLine: "Comparison and stimulation are blurring your inner signal.",
      reframePrompt: "Log out for one hour and reconnect with one offline task.",
      dopamineDrain: true,
      emotionProfile: {
        primaryEmotion: "envy",
        secondaryEmotion: "insecurity",
        underlyingNeed: "self-worth",
        bodyColor: "#A68BB2",
        colorName: "muted plum",
        explanation: "External metrics replaced internal orientation for a while."
      },
      journalEntry: {
        summary: "I got stuck in comparison and lost emotional clarity.",
        awarenessPrompt: "What matters to me beyond visibility?"
      }
    }
  },
  {
    id: "seed-r-10",
    daysAgo: 7,
    hour: 12,
    minute: 11,
    thought: "I am doomscrolling because I do not want to feel this stress.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "fear",
      intensity: 4,
      mirrorLine: "The feed is buffering your stress, not resolving it.",
      reframePrompt: "Close the app and name the stressor in one sentence.",
      dopamineDrain: true,
      emotionProfile: {
        primaryEmotion: "numbness",
        secondaryEmotion: "helplessness",
        underlyingNeed: "regulation",
        bodyColor: "#7A8CA7",
        colorName: "fog blue",
        explanation: "Numbing behavior increases when stress feels unprocessed."
      },
      journalEntry: {
        summary: "I used content to avoid discomfort and felt worse after.",
        awarenessPrompt: "What stress am I avoiding naming directly?"
      }
    }
  },
  {
    id: "seed-r-11",
    daysAgo: 6,
    hour: 9,
    minute: 42,
    thought: "I put my phone away for 30 minutes and felt my mind settle.",
    result: {
      verdict: "AUTHENTIC",
      primaryPattern: "grounded",
      intensity: 2,
      mirrorLine: "Distance from noise gave your nervous system room to settle.",
      reframePrompt: "Protect this reset with one low-noise morning block tomorrow.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "settling",
        secondaryEmotion: "calm clarity",
        underlyingNeed: "peace",
        bodyColor: "#8EA0CC",
        colorName: "moon steel",
        explanation: "Reduced stimulation restored regulation quickly."
      },
      journalEntry: {
        summary: "Stepping away from feeds helped me feel present again.",
        awarenessPrompt: "Where can I create another low-noise window today?"
      }
    }
  },

  // 3) Anxiety / fear / interview-exam arc
  {
    id: "seed-r-12",
    daysAgo: 6,
    hour: 20,
    minute: 55,
    thought: "My interview is tomorrow and my chest is tight.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "fear",
      intensity: 5,
      mirrorLine: "Your body is preparing for threat, not possibility.",
      reframePrompt: "Take five slow exhales and write your first opening line.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "anxiety",
        secondaryEmotion: "insecurity",
        underlyingNeed: "safety",
        bodyColor: "#4E6B8A",
        colorName: "deep storm",
        explanation: "Performance anxiety amplifies risk signals in the body."
      },
      journalEntry: {
        summary: "I felt fear escalate before the interview.",
        awarenessPrompt: "What preparation step reduces uncertainty right now?"
      }
    }
  },
  {
    id: "seed-r-13",
    daysAgo: 5,
    hour: 7,
    minute: 58,
    thought: "I am overwhelmed by exam prep and feel behind.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "fear",
      intensity: 4,
      mirrorLine: "Overwhelm is collapsing the whole plan into one threat blob.",
      reframePrompt: "Split your prep into one 25-minute block and start there.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "anxiety",
        secondaryEmotion: "overwhelm",
        underlyingNeed: "structure",
        bodyColor: "#5E7896",
        colorName: "slate rain",
        explanation: "When tasks are fused together, the nervous system reads danger."
      },
      journalEntry: {
        summary: "I interpreted pressure as proof I could not handle it.",
        awarenessPrompt: "What is the smallest useful unit of progress?"
      }
    }
  },
  {
    id: "seed-r-14",
    daysAgo: 5,
    hour: 23,
    minute: 16,
    thought: "My mind keeps forecasting worst-case outcomes.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "fear",
      intensity: 4,
      mirrorLine: "Catastrophe thinking is your brain trying to pre-control pain.",
      reframePrompt: "Write one likely scenario and one resource you already have.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "fear",
        secondaryEmotion: "anxiety",
        underlyingNeed: "certainty",
        bodyColor: "#6F7EA3",
        colorName: "cold steel",
        explanation: "Forecasting spirals signal unmet safety cues."
      },
      journalEntry: {
        summary: "I noticed fear scripting extreme outcomes.",
        awarenessPrompt: "What is probable, not catastrophic?"
      }
    }
  },
  {
    id: "seed-r-15",
    daysAgo: 4,
    hour: 11,
    minute: 25,
    thought: "Before presenting, I feel shaky and not enough.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "approval_seeking",
      intensity: 4,
      mirrorLine: "The fear of judgment is louder than your actual preparation.",
      reframePrompt: "Anchor in one truth you know well before you begin.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "insecurity",
        secondaryEmotion: "anxiety",
        underlyingNeed: "reassurance",
        bodyColor: "#D79CFF",
        colorName: "lilac pulse",
        explanation: "Self-worth feels externally contingent under evaluation pressure."
      },
      journalEntry: {
        summary: "I sought approval instead of trusting my preparation.",
        awarenessPrompt: "What evidence says I can handle this?"
      }
    }
  },
  {
    id: "seed-r-16",
    daysAgo: 4,
    hour: 18,
    minute: 4,
    thought: "I practiced slowly and feel more grounded for tomorrow.",
    result: {
      verdict: "AUTHENTIC",
      primaryPattern: "intentional",
      intensity: 2,
      mirrorLine: "Preparation and regulation are now working together.",
      reframePrompt: "Keep one calm ritual before the event starts.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "groundedness",
        secondaryEmotion: "hope",
        underlyingNeed: "confidence",
        bodyColor: "#7490E8",
        colorName: "steady sky",
        explanation: "Deliberate practice restored agency and stability."
      },
      journalEntry: {
        summary: "I shifted from panic into prepared focus.",
        awarenessPrompt: "What pre-event ritual should I repeat?"
      }
    }
  },

  // 4) Loneliness / hurt / connection arc
  {
    id: "seed-r-17",
    daysAgo: 4,
    hour: 22,
    minute: 41,
    thought: "I feel left out when everyone else seems connected.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "approval_seeking",
      intensity: 4,
      mirrorLine: "Loneliness is translating into comparison and withdrawal.",
      reframePrompt: "Send one honest check-in to one person you trust.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "loneliness",
        secondaryEmotion: "longing",
        underlyingNeed: "connection",
        bodyColor: "#B59DBD",
        colorName: "orchid dusk",
        explanation: "Belonging needs become louder when social comparison is high."
      },
      journalEntry: {
        summary: "I felt outside of belonging and moved toward isolation.",
        awarenessPrompt: "What safe micro-connection can I make tonight?"
      }
    }
  },
  {
    id: "seed-r-18",
    daysAgo: 3,
    hour: 6,
    minute: 48,
    thought: "I miss them and wake up with heaviness.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "fear",
      intensity: 3,
      mirrorLine: "Missing someone is grief asking for gentle witness.",
      reframePrompt: "Write one memory and one supportive action for today.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "sadness",
        secondaryEmotion: "grief",
        underlyingNeed: "care",
        bodyColor: "#8C839C",
        colorName: "rain violet",
        explanation: "Unmet attachment needs surface as morning heaviness."
      },
      journalEntry: {
        summary: "I touched grief instead of suppressing it.",
        awarenessPrompt: "How can I care for this tenderness today?"
      }
    }
  },
  {
    id: "seed-r-19",
    daysAgo: 3,
    hour: 21,
    minute: 30,
    thought: "I withdrew all day because I felt rejected.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "fear",
      intensity: 4,
      mirrorLine: "Withdrawal is trying to prevent more rejection pain.",
      reframePrompt: "Name the rejection story and test it with one reality check.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "hurt",
        secondaryEmotion: "loneliness",
        underlyingNeed: "belonging",
        bodyColor: "#A784A6",
        colorName: "muted mauve",
        explanation: "Protective isolation rises when belonging feels uncertain."
      },
      journalEntry: {
        summary: "I used distance to avoid more hurt.",
        awarenessPrompt: "What gentle contact is possible without forcing it?"
      }
    }
  },
  {
    id: "seed-r-20",
    daysAgo: 3,
    hour: 12,
    minute: 12,
    thought: "I reached out honestly and felt a little more connected.",
    result: {
      verdict: "AUTHENTIC",
      primaryPattern: "intentional",
      intensity: 2,
      mirrorLine: "Honest connection softened the loneliness loop.",
      reframePrompt: "Repeat this openness with one more trusted person this week.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "care",
        secondaryEmotion: "fondness",
        underlyingNeed: "connection",
        bodyColor: "#5DCBB5",
        colorName: "soft seafoam",
        explanation: "Intentional vulnerability rebuilt relational safety."
      },
      journalEntry: {
        summary: "Connection grew when I spoke directly and gently.",
        awarenessPrompt: "What kind of connection do I want to cultivate next?"
      }
    }
  },

  // 5) Shame / self-judgment / repair arc
  {
    id: "seed-r-21",
    daysAgo: 2,
    hour: 7,
    minute: 36,
    thought: "I made a mistake and now I feel like I am the problem.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "approval_seeking",
      intensity: 4,
      mirrorLine: "Shame is collapsing one mistake into identity.",
      reframePrompt: "Separate what happened from who you are in one sentence.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "shame",
        secondaryEmotion: "insecurity",
        underlyingNeed: "gentleness",
        bodyColor: "#9C7F98",
        colorName: "ash plum",
        explanation: "Self-judgment appears when belonging feels at risk."
      },
      journalEntry: {
        summary: "I merged behavior error with self-worth.",
        awarenessPrompt: "What compassionate correction is possible now?"
      }
    }
  },
  {
    id: "seed-r-22",
    daysAgo: 2,
    hour: 23,
    minute: 3,
    thought: "I keep hearing an inner voice saying I am not enough.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "approval_seeking",
      intensity: 4,
      mirrorLine: "The inner critic is asking for safety in a harsh way.",
      reframePrompt: "Answer the critic with one truthful, kind counter-line.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "shame",
        secondaryEmotion: "hurt",
        underlyingNeed: "reassurance",
        bodyColor: "#A68BB2",
        colorName: "quiet plum",
        explanation: "Harsh self-talk often masks fear of rejection."
      },
      journalEntry: {
        summary: "My inner language turned punitive under stress.",
        awarenessPrompt: "What would I say to a friend in this same moment?"
      }
    }
  },
  {
    id: "seed-r-23",
    daysAgo: 1,
    hour: 10,
    minute: 28,
    thought: "After being rejected, I feel small and frozen.",
    result: {
      verdict: "AUTOPILOT",
      primaryPattern: "fear",
      intensity: 4,
      mirrorLine: "Rejection pain is active, and your system is in protect mode.",
      reframePrompt: "Take one body reset and name one skill that still remains true.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "sadness",
        secondaryEmotion: "shame",
        underlyingNeed: "belonging",
        bodyColor: "#8C839C",
        colorName: "storm mauve",
        explanation: "Rejection can temporarily shrink identity and agency."
      },
      journalEntry: {
        summary: "I felt identity collapse after rejection feedback.",
        awarenessPrompt: "What value in me is unchanged by this outcome?"
      }
    }
  },
  {
    id: "seed-r-24",
    daysAgo: 1,
    hour: 20,
    minute: 42,
    thought: "I can repair this without humiliating myself.",
    result: {
      verdict: "AUTHENTIC",
      primaryPattern: "grounded",
      intensity: 2,
      mirrorLine: "Self-respect and accountability are both available here.",
      reframePrompt: "State the repair step and release the self-punishment.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "openness",
        secondaryEmotion: "groundedness",
        underlyingNeed: "truth",
        bodyColor: "#87A2FF",
        colorName: "clear periwinkle",
        explanation: "Compassionate accountability restores regulation."
      },
      journalEntry: {
        summary: "I chose repair over self-attack.",
        awarenessPrompt: "What respectful follow-through proves this change?"
      }
    }
  },

  // 6) Gratitude / calm / grounded / relief arc
  {
    id: "seed-r-25",
    daysAgo: 1,
    hour: 6,
    minute: 54,
    thought: "Morning walk made me feel grateful and settled.",
    result: {
      verdict: "AUTHENTIC",
      primaryPattern: "grounded",
      intensity: 2,
      mirrorLine: "Your body and attention are aligned in a restorative state.",
      reframePrompt: "Carry this pace into your first decision today.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "gratitude",
        secondaryEmotion: "calm clarity",
        underlyingNeed: "meaning",
        bodyColor: "#B4C86D",
        colorName: "sage gold",
        explanation: "Gratitude widened perspective and reduced reactivity."
      },
      journalEntry: {
        summary: "I felt quietly nourished and mentally clear.",
        awarenessPrompt: "How can I protect this rhythm through the day?"
      }
    }
  },
  {
    id: "seed-r-26",
    daysAgo: 0,
    hour: 9,
    minute: 5,
    thought: "I finally finished the hardest task and feel relieved.",
    result: {
      verdict: "AUTHENTIC",
      primaryPattern: "grounded",
      intensity: 2,
      mirrorLine: "Completion is allowing your nervous system to exhale.",
      reframePrompt: "Take a short reset before starting the next block.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "relief",
        secondaryEmotion: "calm clarity",
        underlyingNeed: "rest",
        bodyColor: "#8ED5BE",
        colorName: "soft mint",
        explanation: "Relief is a natural downshift after sustained load."
      },
      journalEntry: {
        summary: "Finishing brought emotional space and softer breathing.",
        awarenessPrompt: "What recovery action would help this relief last?"
      }
    }
  },
  {
    id: "seed-r-27",
    daysAgo: 0,
    hour: 6,
    minute: 22,
    thought: "After prayer I feel peaceful and less reactive.",
    result: {
      verdict: "AUTHENTIC",
      primaryPattern: "grounded",
      intensity: 1,
      mirrorLine: "Your system feels regulated enough for wise pacing.",
      reframePrompt: "Let this stillness shape how you reply today.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "calm clarity",
        secondaryEmotion: "settling",
        underlyingNeed: "peace",
        bodyColor: "#5B6CFF",
        colorName: "steady indigo",
        explanation: "Spiritual pause reduced urgency and restored choice."
      },
      journalEntry: {
        summary: "I felt my baseline return to calm.",
        awarenessPrompt: "Which action keeps this peaceful tone intact?"
      }
    }
  },
  {
    id: "seed-r-28",
    daysAgo: 0,
    hour: 12,
    minute: 48,
    thought: "I am responding slowly and intentionally now.",
    result: {
      verdict: "AUTHENTIC",
      primaryPattern: "intentional",
      intensity: 2,
      mirrorLine: "You are leading with choice rather than impulse.",
      reframePrompt: "Keep each sentence brief, truthful, and kind.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "resolve",
        secondaryEmotion: "openness",
        underlyingNeed: "alignment",
        bodyColor: "#34BFA3",
        colorName: "intentional teal",
        explanation: "Regulation and values are cooperating in this state."
      },
      journalEntry: {
        summary: "I stayed value-led in a moment that used to trigger urgency.",
        awarenessPrompt: "What boundary protects this intentional pace?"
      }
    }
  },
  {
    id: "seed-r-29",
    daysAgo: 0,
    hour: 20,
    minute: 5,
    thought: "Tonight I feel peaceful, present, and thankful.",
    result: {
      verdict: "AUTHENTIC",
      primaryPattern: "grounded",
      intensity: 1,
      mirrorLine: "This is a restorative state worth consciously preserving.",
      reframePrompt: "Close the day with one gratitude note and one intention.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "gratitude",
        secondaryEmotion: "relief",
        underlyingNeed: "peace",
        bodyColor: "#9FC97A",
        colorName: "olive glow",
        explanation: "A grateful state helps integrate effort and recovery."
      },
      journalEntry: {
        summary: "I felt steady appreciation instead of urgency.",
        awarenessPrompt: "What helped me arrive here today?"
      }
    }
  },

  // 7) Anticipation / excitement / curiosity arc
  {
    id: "seed-r-30",
    daysAgo: 0,
    hour: 15,
    minute: 16,
    thought: "I am excited for the demo and want to channel this well.",
    result: {
      verdict: "AUTHENTIC",
      primaryPattern: "intentional",
      intensity: 3,
      mirrorLine: "Energy is high, and your awareness is keeping it constructive.",
      reframePrompt: "Convert excitement into one clear execution checklist.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "excitement",
        secondaryEmotion: "hope",
        underlyingNeed: "expression",
        bodyColor: "#F7A55C",
        colorName: "sunlit amber",
        explanation: "Activation is being directed through intention, not panic."
      },
      journalEntry: {
        summary: "I felt energized and focused before presenting.",
        awarenessPrompt: "How do I keep this enthusiasm grounded?"
      }
    }
  },
  {
    id: "seed-r-31",
    daysAgo: 0,
    hour: 16,
    minute: 55,
    thought: "I feel curious instead of afraid about what feedback we get.",
    result: {
      verdict: "AUTHENTIC",
      primaryPattern: "intentional",
      intensity: 2,
      mirrorLine: "Curiosity is creating emotional space around uncertainty.",
      reframePrompt: "Capture feedback as data first, interpretation later.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "openness",
        secondaryEmotion: "curiosity",
        underlyingNeed: "growth",
        bodyColor: "#87A2FF",
        colorName: "open sky",
        explanation: "Curiosity stabilizes performance pressure into learning energy."
      },
      journalEntry: {
        summary: "I reframed uncertainty as information instead of threat.",
        awarenessPrompt: "What can I learn quickly from today?"
      }
    }
  },
  {
    id: "seed-r-32",
    daysAgo: 0,
    hour: 21,
    minute: 34,
    thought: "I feel hopeful about tomorrow and want to keep momentum gentle.",
    result: {
      verdict: "AUTHENTIC",
      primaryPattern: "grounded",
      intensity: 2,
      mirrorLine: "Hope is present with enough steadiness to stay realistic.",
      reframePrompt: "Choose one meaningful next step and protect your rest.",
      dopamineDrain: false,
      emotionProfile: {
        primaryEmotion: "hope",
        secondaryEmotion: "groundedness",
        underlyingNeed: "meaning",
        bodyColor: "#6AB7B0",
        colorName: "aqua hope",
        explanation: "Hope becomes durable when paired with grounded pacing."
      },
      journalEntry: {
        summary: "I ended the day with optimism and restraint.",
        awarenessPrompt: "What one action keeps tomorrow aligned?"
      }
    }
  }
];

const EMOTION_LOG_SEEDS: EmotionLogSeed[] = [
  {
    id: "seed-e-01",
    emotionId: "anger",
    intensity: 4,
    note: "My shoulders were tense after a hard conversation.",
    daysAgo: 11,
    hour: 20,
    minute: 40
  },
  {
    id: "seed-e-02",
    emotionId: "numbness",
    intensity: 4,
    note: "Scrolled mindlessly and felt disconnected from myself.",
    daysAgo: 8,
    hour: 1,
    minute: 25
  },
  {
    id: "seed-e-03",
    emotionId: "anxiety",
    intensity: 5,
    note: "Interview prep made my heartbeat spike.",
    daysAgo: 6,
    hour: 19,
    minute: 52
  },
  {
    id: "seed-e-04",
    emotionId: "loneliness",
    intensity: 4,
    note: "Felt disconnected after everyone signed off.",
    daysAgo: 4,
    hour: 22,
    minute: 10
  },
  {
    id: "seed-e-05",
    emotionId: "shame",
    intensity: 4,
    note: "I kept replaying one mistake and shrinking.",
    daysAgo: 2,
    hour: 7,
    minute: 8
  },
  {
    id: "seed-e-06",
    emotionId: "relief",
    intensity: 2,
    note: "Task completed, body finally softened.",
    daysAgo: 0,
    hour: 9,
    minute: 40
  },
  {
    id: "seed-e-07",
    emotionId: "gratitude",
    intensity: 2,
    note: "Small support from a friend changed my day.",
    daysAgo: 0,
    hour: 20,
    minute: 45
  },
  {
    id: "seed-e-08",
    emotionId: "hope",
    intensity: 3,
    note: "I feel possibility returning after today’s work.",
    daysAgo: 0,
    hour: 22,
    minute: 5
  }
];

const NOTE_SEEDS: NoteSeed[] = [
  {
    id: "seed-n-01",
    title: "When anger spikes, what I actually need",
    body:
      "Anger usually means a boundary was crossed. Before replying: breathe, name the hurt, then state one boundary sentence.",
    tags: ["anger", "boundaries", "repair"],
    linkedReflectionId: "seed-r-01",
    daysAgo: 11,
    hour: 23,
    minute: 5,
    updatedShiftMinutes: 42
  },
  {
    id: "seed-n-02",
    title: "Doomscroll pattern snapshot",
    body:
      "Signals: numb eyes, restless thumb, rising anxiety. Replacement: 2-minute walk + water + one intentional action.",
    tags: ["doomscroll", "dopamine", "reset"],
    linkedReflectionId: "seed-r-07",
    daysAgo: 8,
    hour: 2,
    minute: 10,
    updatedShiftMinutes: 55
  },
  {
    id: "seed-n-03",
    title: "Interview pre-regulation script",
    body:
      "Inhale 4 / exhale 6 for five rounds. Speak first sentence slowly. Keep shoulders down. Focus on value, not performance.",
    tags: ["interview", "fear", "grounded"],
    linkedReflectionId: "seed-r-12",
    daysAgo: 6,
    hour: 21,
    minute: 25,
    updatedShiftMinutes: 38
  },
  {
    id: "seed-n-04",
    title: "When loneliness becomes withdrawal",
    body:
      "I tend to disappear when I feel unseen. New move: send one real message before isolating fully.",
    tags: ["loneliness", "connection", "care"],
    linkedReflectionId: "seed-r-17",
    daysAgo: 4,
    hour: 23,
    minute: 2,
    updatedShiftMinutes: 16
  },
  {
    id: "seed-n-05",
    title: "Questions before reacting",
    body:
      "What am I feeling? What do I need? What outcome matters most tomorrow, not just tonight?",
    tags: ["intentional", "clarity", "communication"],
    linkedReflectionId: "seed-r-06",
    daysAgo: 9,
    hour: 8,
    minute: 18,
    updatedShiftMinutes: 20
  },
  {
    id: "seed-n-06",
    title: "Autopilot signs in my body",
    body:
      "Jaw clenches, breathing gets shallow, urge to respond immediately. This is my cue to pause before action.",
    tags: ["autopilot", "awareness", "somatic"],
    linkedReflectionId: "seed-r-03",
    daysAgo: 10,
    hour: 22,
    minute: 22,
    updatedShiftMinutes: 33
  },
  {
    id: "seed-n-07",
    title: "What groundedness feels like",
    body:
      "Slower speech, wider attention, less proving. I can hear myself and others at the same time.",
    tags: ["grounded", "nervous-system", "presence"],
    linkedReflectionId: "seed-r-27",
    daysAgo: 0,
    hour: 7,
    minute: 3,
    updatedShiftMinutes: 24
  },
  {
    id: "seed-n-08",
    title: "Small truths I want to remember",
    body:
      "I do better when I pause. Clarity beats speed. Gentle consistency changes more than intense bursts.",
    tags: ["truth", "self-trust", "slow"],
    linkedReflectionId: "seed-r-29",
    daysAgo: 0,
    hour: 20,
    minute: 58,
    updatedShiftMinutes: 30
  },
  {
    id: "seed-n-09",
    title: "Evening reset protocol",
    body:
      "No short-form feeds after 10pm. Shower, stretch, three lines of journal, sleep intent.",
    tags: ["reset", "sleep", "dopamine"],
    daysAgo: 7,
    hour: 23,
    minute: 40,
    updatedShiftMinutes: 12
  },
  {
    id: "seed-n-10",
    title: "Repair after self-judgment",
    body:
      "1) Separate behavior from identity. 2) Name one correction. 3) Speak to self with the tone I use for friends.",
    tags: ["shame", "repair", "self-compassion"],
    linkedReflectionId: "seed-r-24",
    daysAgo: 1,
    hour: 21,
    minute: 15,
    updatedShiftMinutes: 28
  },
  {
    id: "seed-n-11",
    title: "Curiosity prompts for feedback days",
    body:
      "What surprised me? What strengthened me? What is one experiment for tomorrow?",
    tags: ["curiosity", "growth", "feedback"],
    linkedReflectionId: "seed-r-31",
    daysAgo: 0,
    hour: 17,
    minute: 20,
    updatedShiftMinutes: 26
  },
  {
    id: "seed-n-12",
    title: "My connection checklist",
    body:
      "When I feel isolated: voice note to one person, 10-minute walk, no comparison content.",
    tags: ["connection", "loneliness", "ritual"],
    daysAgo: 3,
    hour: 22,
    minute: 14,
    updatedShiftMinutes: 21
  }
];

function buildReflectionJournalRecords(): JournalRecord[] {
  return REFLECTION_SEEDS.map((seed) => ({
    id: seed.id,
    timestamp: timestampFrom(seed.daysAgo, seed.hour, seed.minute),
    source: "reflection",
    originalThought: seed.thought,
    verdict: seed.result.verdict,
    primaryPattern: seed.result.primaryPattern,
    intensity: seed.result.intensity,
    mirrorLine: seed.result.mirrorLine,
    reframePrompt: seed.result.reframePrompt,
    dopamineDrain: seed.result.dopamineDrain,
    emotionProfile: seed.result.emotionProfile,
    journalEntry: seed.result.journalEntry
  }));
}

function buildEmotionLogJournalRecords(): JournalRecord[] {
  return EMOTION_LOG_SEEDS.flatMap((seed) => {
    const emotion = getEmotionCatalogItem(seed.emotionId);

    if (!emotion) {
      return [];
    }

    const baseLog = buildEmotionLogEntry({
      emotion,
      intensity: seed.intensity,
      note: seed.note
    });

    return [
      {
        id: seed.id,
        timestamp: timestampFrom(seed.daysAgo, seed.hour, seed.minute),
        ...baseLog
      }
    ];
  });
}

function buildSeedNotes(): NoteRecord[] {
  return NOTE_SEEDS.map((seed) => {
    const createdAt = timestampFrom(seed.daysAgo, seed.hour, seed.minute);
    const updatedAtDate = new Date(createdAt);
    updatedAtDate.setMinutes(updatedAtDate.getMinutes() + (seed.updatedShiftMinutes ?? 12));

    return {
      id: seed.id,
      title: seed.title,
      body: seed.body,
      tags: seed.tags,
      linkedReflectionId: seed.linkedReflectionId,
      createdAt,
      updatedAt: updatedAtDate.toISOString()
    };
  });
}

function getDerivedUnlockKeys(existingKeys: readonly string[]) {
  return existingKeys.filter((key) => {
    const normalized = key.toLowerCase();
    return normalized.startsWith("sahej-") && (normalized.includes("unlock") || normalized.includes("discover"));
  });
}

export interface DemoSeedResult {
  reflections: number;
  notes: number;
  emotionLogs: number;
  clearedKeys: string[];
}

export async function seedDemoData(): Promise<DemoSeedResult> {
  const reflectionEntries = buildReflectionJournalRecords();
  const emotionLogs = buildEmotionLogJournalRecords();
  const notes = buildSeedNotes();

  const existingKeys = await AsyncStorage.getAllKeys();
  const clearKeys = Array.from(
    new Set([
      JOURNAL_STORAGE_KEY,
      NOTES_STORAGE_KEY,
      DEMO_SEED_FLAG_KEY,
      ...POSSIBLE_UNLOCK_KEYS,
      ...getDerivedUnlockKeys(existingKeys)
    ])
  );

  clearLatestReflection();
  await clearJournalEntries();
  await clearNotes();
  await AsyncStorage.multiRemove(clearKeys);

  await replaceJournalEntries([...reflectionEntries, ...emotionLogs]);
  await replaceNotes(notes);
  await AsyncStorage.setItem(DEMO_SEED_FLAG_KEY, new Date().toISOString());

  return {
    reflections: reflectionEntries.length,
    notes: notes.length,
    emotionLogs: emotionLogs.length,
    clearedKeys: clearKeys
  };
}
