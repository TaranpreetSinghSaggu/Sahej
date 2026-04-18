import express from "express";

import { AppError, errorHandler } from "./middleware/error.middleware";
import consequencePreviewRouter from "./routes/consequencePreview.route";
import healthRouter from "./routes/health.route";
import interceptRouter from "./routes/intercept.route";
import reflectRouter from "./routes/reflect.route";
import voiceStateRouter from "./routes/voiceState.route";
import weeklyMirrorRouter from "./routes/weeklyMirror.route";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/intercept", interceptRouter);
app.use("/consequence-preview", consequencePreviewRouter);
app.use("/voice-state", voiceStateRouter);
app.use("/weekly-mirror", weeklyMirrorRouter);
app.use("/reflect", reflectRouter);

app.use((_req, _res, next) => {
  next(new AppError(404, "Route not found"));
});

app.use(errorHandler);

export default app;
