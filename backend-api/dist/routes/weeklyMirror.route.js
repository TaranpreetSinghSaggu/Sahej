"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const weeklyMirror_controller_1 = require("../controllers/weeklyMirror.controller");
const weeklyMirrorRouter = (0, express_1.Router)();
weeklyMirrorRouter.get("/", weeklyMirror_controller_1.weeklyMirror);
exports.default = weeklyMirrorRouter;
