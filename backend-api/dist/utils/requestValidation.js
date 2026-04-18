"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptionalVolumeTrend = exports.getOptionalReflectionPattern = exports.getOptionalInteger = exports.getOptionalBoolean = exports.getRequiredTrimmedText = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const consequencePreview_1 = require("../types/consequencePreview");
const voiceState_1 = require("../types/voiceState");
const getRequiredTrimmedText = (value, fieldName) => {
    if (typeof value !== "string") {
        throw new error_middleware_1.AppError(400, `${fieldName} is required and must be a string`);
    }
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        throw new error_middleware_1.AppError(400, `${fieldName} must not be empty`);
    }
    if (trimmedValue.length > 1000) {
        throw new error_middleware_1.AppError(400, `${fieldName} must be 1000 characters or fewer`);
    }
    return trimmedValue;
};
exports.getRequiredTrimmedText = getRequiredTrimmedText;
const getOptionalBoolean = (value, fieldName) => {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== "boolean") {
        throw new error_middleware_1.AppError(400, `${fieldName} must be a boolean`);
    }
    return value;
};
exports.getOptionalBoolean = getOptionalBoolean;
const getOptionalInteger = (value, fieldName, options = {}) => {
    if (value === undefined) {
        return undefined;
    }
    if (!Number.isInteger(value)) {
        throw new error_middleware_1.AppError(400, `${fieldName} must be an integer`);
    }
    const numericValue = value;
    if (options.min !== undefined && numericValue < options.min) {
        throw new error_middleware_1.AppError(400, `${fieldName} must be at least ${options.min}`);
    }
    if (options.max !== undefined && numericValue > options.max) {
        throw new error_middleware_1.AppError(400, `${fieldName} must be at most ${options.max}`);
    }
    return numericValue;
};
exports.getOptionalInteger = getOptionalInteger;
const getOptionalReflectionPattern = (value, fieldName) => {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== "string" || !consequencePreview_1.REFLECTION_PATTERNS.includes(value)) {
        throw new error_middleware_1.AppError(400, `${fieldName} must be a valid reflection pattern`);
    }
    return value;
};
exports.getOptionalReflectionPattern = getOptionalReflectionPattern;
const getOptionalVolumeTrend = (value, fieldName) => {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== "string" || !voiceState_1.VOLUME_TRENDS.includes(value)) {
        throw new error_middleware_1.AppError(400, `${fieldName} must be a valid volume trend`);
    }
    return value;
};
exports.getOptionalVolumeTrend = getOptionalVolumeTrend;
