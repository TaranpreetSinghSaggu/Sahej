"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthRouter = (0, express_1.Router)();
healthRouter.get("/", (_req, res) => {
    res.json({ ok: true });
});
exports.default = healthRouter;
