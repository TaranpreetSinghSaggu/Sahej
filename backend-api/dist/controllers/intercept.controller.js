"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intercept = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const interceptAnalysis_1 = require("../utils/interceptAnalysis");
const normalizeThought_1 = require("../utils/normalizeThought");
const requestValidation_1 = require("../utils/requestValidation");
const intercept = (req, res, next) => {
    try {
        const thought = (0, requestValidation_1.getRequiredTrimmedText)(req.body?.thought, "thought");
        const normalizedThought = (0, normalizeThought_1.normalizeThought)(thought);
        const metadata = {
            openedCount5m: (0, requestValidation_1.getOptionalInteger)(req.body?.openedCount5m, "openedCount5m", {
                min: 0
            }),
            localHour: (0, requestValidation_1.getOptionalInteger)(req.body?.localHour, "localHour", {
                min: 0,
                max: 23
            }),
            typingBurst: (0, requestValidation_1.getOptionalBoolean)(req.body?.typingBurst, "typingBurst")
        };
        return res.status(200).json((0, interceptAnalysis_1.analyzeIntercept)(normalizedThought, metadata));
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            return next(error);
        }
        return next(error);
    }
};
exports.intercept = intercept;
