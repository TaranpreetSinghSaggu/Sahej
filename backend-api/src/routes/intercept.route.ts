import { Router } from "express";

import { intercept } from "../controllers/intercept.controller";

const interceptRouter = Router();

interceptRouter.post("/", intercept);

export default interceptRouter;
