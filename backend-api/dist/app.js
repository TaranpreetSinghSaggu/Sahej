"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const error_middleware_1 = require("./middleware/error.middleware");
const health_route_1 = __importDefault(require("./routes/health.route"));
const reflect_route_1 = __importDefault(require("./routes/reflect.route"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/health", health_route_1.default);
app.use("/reflect", reflect_route_1.default);
app.use((_req, _res, next) => {
    next(new error_middleware_1.AppError(404, "Route not found"));
});
app.use(error_middleware_1.errorHandler);
exports.default = app;
