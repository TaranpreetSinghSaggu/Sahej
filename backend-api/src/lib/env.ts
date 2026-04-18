import dotenv from "dotenv";

dotenv.config();

function parseBooleanFlag(value: string | undefined, fallback = false) {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

const DEFAULT_PORT = 3001;
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_OPENAI_TIMEOUT_MS = 1800;
const DEFAULT_OPENAI_BEST_EFFORT_BUDGET_MS = 1500;
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
const DEFAULT_GEMINI_TIMEOUT_MS = 1600;
const DEFAULT_GEMINI_BEST_EFFORT_BUDGET_MS = 1100;
const DEFAULT_GEMINI_RETRY_DELAY_MS = 150;
const parsedPort = Number(process.env.PORT);
const parsedOpenaiTimeoutMs = Number(process.env.OPENAI_TIMEOUT_MS);
const parsedOpenaiBestEffortBudgetMs = Number(process.env.OPENAI_BEST_EFFORT_BUDGET_MS);
const parsedGeminiTimeoutMs = Number(process.env.GEMINI_TIMEOUT_MS);
const parsedGeminiBestEffortBudgetMs = Number(process.env.GEMINI_BEST_EFFORT_BUDGET_MS);
const parsedGeminiRetryDelayMs = Number(process.env.GEMINI_RETRY_DELAY_MS);

export const env = {
  port: Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : DEFAULT_PORT,
  demoMode: parseBooleanFlag(process.env.DEMO_MODE, false),
  openaiApiKey: process.env.OPENAI_API_KEY?.trim() ?? "",
  openaiModel: process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL,
  openaiTimeoutMs:
    Number.isInteger(parsedOpenaiTimeoutMs) && parsedOpenaiTimeoutMs > 0
      ? parsedOpenaiTimeoutMs
      : DEFAULT_OPENAI_TIMEOUT_MS,
  openaiBestEffortBudgetMs:
    Number.isInteger(parsedOpenaiBestEffortBudgetMs) && parsedOpenaiBestEffortBudgetMs > 0
      ? parsedOpenaiBestEffortBudgetMs
      : DEFAULT_OPENAI_BEST_EFFORT_BUDGET_MS,
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() ?? "",
  geminiModel: process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
  geminiTimeoutMs:
    Number.isInteger(parsedGeminiTimeoutMs) && parsedGeminiTimeoutMs > 0
      ? parsedGeminiTimeoutMs
      : DEFAULT_GEMINI_TIMEOUT_MS,
  geminiBestEffortBudgetMs:
    Number.isInteger(parsedGeminiBestEffortBudgetMs) && parsedGeminiBestEffortBudgetMs > 0
      ? parsedGeminiBestEffortBudgetMs
      : DEFAULT_GEMINI_BEST_EFFORT_BUDGET_MS,
  geminiRetryDelayMs:
    Number.isInteger(parsedGeminiRetryDelayMs) && parsedGeminiRetryDelayMs >= 0
      ? parsedGeminiRetryDelayMs
      : DEFAULT_GEMINI_RETRY_DELAY_MS
};
