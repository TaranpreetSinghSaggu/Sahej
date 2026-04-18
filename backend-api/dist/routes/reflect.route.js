"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reflect_controller_1 = require("../controllers/reflect.controller");
const reflectRouter = (0, express_1.Router)();
reflectRouter.post("/", reflect_controller_1.reflect);
exports.default = reflectRouter;
