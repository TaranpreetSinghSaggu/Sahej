import { ConsequencePreviewResult } from "../types/consequencePreview";
import { ReflectionPattern } from "../types/reflection";

export const buildConsequencePreview = (
  primaryPattern: ReflectionPattern
): ConsequencePreviewResult => {
  switch (primaryPattern) {
    case "ego":
      return {
        autopilotOutcome: "You get a brief hit of certainty, then more friction.",
        alignedOutcome: "You protect your dignity and keep the response clean.",
        suggestedAction: "rewrite"
      };
    case "venting":
      return {
        autopilotOutcome: "You discharge heat fast, but the situation stays noisy.",
        alignedOutcome: "You cool the moment and speak from steadier ground.",
        suggestedAction: "pause"
      };
    case "approval_seeking":
      return {
        autopilotOutcome: "You chase reassurance and still feel unsettled after.",
        alignedOutcome: "You let the urge settle before asking for anything.",
        suggestedAction: "wait"
      };
    case "fear":
      return {
        autopilotOutcome: "You stay inside the loop and the anxiety keeps feeding itself.",
        alignedOutcome: "You create space and the next move becomes clearer.",
        suggestedAction: "pause"
      };
    case "intentional":
    case "grounded":
    default:
      return {
        autopilotOutcome: "If you rush this, your clarity will get diluted.",
        alignedOutcome: "If you stay steady, the next step will stay clean.",
        suggestedAction: "wait"
      };
  }
};
