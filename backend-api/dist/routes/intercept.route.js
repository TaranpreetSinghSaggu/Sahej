"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const intercept_controller_1 = require("../controllers/intercept.controller");
const interceptRouter = (0, express_1.Router)();
interceptRouter.post("/", intercept_controller_1.intercept);
exports.default = interceptRouter;
