"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reflect = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const mockReflection = {
    verdict: "AUTHENTIC",
    primaryPattern: "grounded",
    intensity: 2,
    mirrorLine: "This sounds more reflective than reactive right now.",
    reframePrompt: "What is the clearest next step you can take with calm intent?",
    dopamineDrain: false
};
const reflect = (req, res, next) => {
    const { thought } = req.body;
    if (typeof thought !== "string" || thought.trim().length === 0) {
        return next(new error_middleware_1.AppError(400, "thought is required and must be a non-empty string"));
    }
    return res.status(200).json(mockReflection);
};
exports.reflect = reflect;
