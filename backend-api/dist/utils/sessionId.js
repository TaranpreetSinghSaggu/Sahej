"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionId = void 0;
const DEFAULT_SESSION_ID = "demo-session";
const getSessionId = (headerValue) => {
    const rawValue = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    const trimmedValue = rawValue?.trim();
    if (!trimmedValue) {
        return DEFAULT_SESSION_ID;
    }
    return trimmedValue;
};
exports.getSessionId = getSessionId;
