import express from "express";

import { AppError, errorHandler } from "./middleware/error.middleware";
import healthRouter from "./routes/health.route";
import reflectRouter from "./routes/reflect.route";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/reflect", reflectRouter);

app.use((_req, _res, next) => {
  next(new AppError(404, "Route not found"));
});

app.use(errorHandler);

export default app;
