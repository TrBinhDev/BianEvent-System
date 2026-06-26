import { Router, IRouter } from "express";
import * as eventsController from "./events.controller";

const router: IRouter = Router();

router.get("/", eventsController.getEvents);
router.get("/categories", eventsController.getCategories);
router.get("/:id", eventsController.getEventById);

export default router;
