import { Router } from "express";

import { voiceState } from "../controllers/voiceState.controller";

const voiceStateRouter = Router();

voiceStateRouter.post("/", voiceState);

export default voiceStateRouter;
