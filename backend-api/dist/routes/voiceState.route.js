"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const voiceState_controller_1 = require("../controllers/voiceState.controller");
const voiceStateRouter = (0, express_1.Router)();
voiceStateRouter.post("/", voiceState_controller_1.voiceState);
exports.default = voiceStateRouter;
