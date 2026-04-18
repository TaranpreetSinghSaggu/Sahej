"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weeklyMirror = void 0;
const sessionId_1 = require("../utils/sessionId");
const sessionMemory_1 = require("../utils/sessionMemory");
const weeklyMirror_1 = require("../utils/weeklyMirror");
const weeklyMirror = (req, res) => {
    const sessionId = (0, sessionId_1.getSessionId)(req.headers["x-session-id"]);
    const events = (0, sessionMemory_1.getSessionReflectionEvents)(sessionId);
    return res.status(200).json((0, weeklyMirror_1.buildWeeklyMirror)(events));
};
exports.weeklyMirror = weeklyMirror;
