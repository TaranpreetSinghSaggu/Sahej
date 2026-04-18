"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionReflectionEvents = exports.appendSessionReflectionEvent = void 0;
const MAX_EVENTS_PER_SESSION = 50;
const sessionEvents = new Map();
const appendSessionReflectionEvent = (sessionId, event) => {
    const existingEvents = sessionEvents.get(sessionId) ?? [];
    const nextEvents = [...existingEvents, event].slice(-MAX_EVENTS_PER_SESSION);
    sessionEvents.set(sessionId, nextEvents);
};
exports.appendSessionReflectionEvent = appendSessionReflectionEvent;
const getSessionReflectionEvents = (sessionId) => [...(sessionEvents.get(sessionId) ?? [])];
exports.getSessionReflectionEvents = getSessionReflectionEvents;
