import { Router } from "express";

import { consequencePreview } from "../controllers/consequencePreview.controller";

const consequencePreviewRouter = Router();

consequencePreviewRouter.post("/", consequencePreview);

export default consequencePreviewRouter;
