"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const consequencePreview_controller_1 = require("../controllers/consequencePreview.controller");
const consequencePreviewRouter = (0, express_1.Router)();
consequencePreviewRouter.post("/", consequencePreview_controller_1.consequencePreview);
exports.default = consequencePreviewRouter;
