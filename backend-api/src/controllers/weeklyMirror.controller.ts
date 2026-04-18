import { RequestHandler } from "express";

import { WeeklyMirrorResult } from "../types/weeklyMirror";
import { getSessionId } from "../utils/sessionId";
import { getSessionReflectionEvents } from "../utils/sessionMemory";
import { buildWeeklyMirror } from "../utils/weeklyMirror";

export const weeklyMirror: RequestHandler<Record<string, never>, WeeklyMirrorResult> = (req, res) => {
  const sessionId = getSessionId(req.headers["x-session-id"]);
  const events = getSessionReflectionEvents(sessionId);

  return res.status(200).json(buildWeeklyMirror(events));
};
