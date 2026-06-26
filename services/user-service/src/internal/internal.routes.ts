import { Router, IRouter } from "express";
import * as internalController from "./internal.controller";

import { internalAuth } from "../middlewares/internal";

const router: IRouter = Router();

router.use(internalAuth);

router.get("/users/:id", internalController.getUserById);
router.post("/users/batch", internalController.getUsersByIds);
router.post("/users/verify-token", internalController.verifyToken);

export default router;
