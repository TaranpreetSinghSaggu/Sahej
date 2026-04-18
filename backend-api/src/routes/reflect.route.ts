import { Router } from "express";

import { reflect } from "../controllers/reflect.controller";

const reflectRouter = Router();

reflectRouter.post("/", reflect);

export default reflectRouter;
