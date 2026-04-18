"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consequencePreview = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const consequencePreview_1 = require("../utils/consequencePreview");
const mockReflection_1 = require("../utils/mockReflection");
const normalizeThought_1 = require("../utils/normalizeThought");
const requestValidation_1 = require("../utils/requestValidation");
const consequencePreview = (req, res, next) => {
    try {
        const thought = (0, requestValidation_1.getRequiredTrimmedText)(req.body?.thought, "thought");
        const normalizedThought = (0, normalizeThought_1.normalizeThought)(thought);
        const primaryPattern = (0, requestValidation_1.getOptionalReflectionPattern)(req.body?.primaryPattern, "primaryPattern") ??
            (0, mockReflection_1.createMockReflection)(normalizedThought).primaryPattern;
        return res.status(200).json((0, consequencePreview_1.buildConsequencePreview)(primaryPattern));
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            return next(error);
        }
        return next(error);
    }
};
exports.consequencePreview = consequencePreview;
