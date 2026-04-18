import { SessionReflectionEvent } from "../types/session";

const MAX_EVENTS_PER_SESSION = 50;
const sessionEvents = new Map<string, SessionReflectionEvent[]>();

export const appendSessionReflectionEvent = (
  sessionId: string,
  event: SessionReflectionEvent
): void => {
  const existingEvents = sessionEvents.get(sessionId) ?? [];
  const nextEvents = [...existingEvents, event].slice(-MAX_EVENTS_PER_SESSION);

  sessionEvents.set(sessionId, nextEvents);
};

export const getSessionReflectionEvents = (sessionId: string): SessionReflectionEvent[] =>
  [...(sessionEvents.get(sessionId) ?? [])];
