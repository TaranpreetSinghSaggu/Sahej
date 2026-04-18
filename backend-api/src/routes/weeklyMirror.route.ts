import { Router } from "express";

import { weeklyMirror } from "../controllers/weeklyMirror.controller";

const weeklyMirrorRouter = Router();

weeklyMirrorRouter.get("/", weeklyMirror);

export default weeklyMirrorRouter;
