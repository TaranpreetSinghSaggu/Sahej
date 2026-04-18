"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
    }
}
exports.AppError = AppError;
const errorHandler = (error, _req, res, _next) => {
    if (error instanceof SyntaxError &&
        "status" in error &&
        error.status === 400 &&
        "body" in error) {
        return res.status(400).json({ error: "Invalid JSON body" });
    }
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
};
exports.errorHandler = errorHandler;
