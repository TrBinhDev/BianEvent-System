import { Router, IRouter } from "express";
import * as eventsController from "../events/events.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router: IRouter = Router();

router.get(
  "/events",
  authenticate,
  authorize("ORGANIZER"),
  eventsController.getOrganizerEvents,
);
router.post(
  "/events",
  authenticate,
  authorize("ORGANIZER"),
  eventsController.createEvent,
);
router.get(
  "/events/:id",
  authenticate,
  authorize("ORGANIZER"),
  eventsController.getOrganizerEventById,
);
router.patch(
  "/events/:id",
  authenticate,
  authorize("ORGANIZER"),
  eventsController.updateEvent,
);
router.patch(
  "/events/:id/status",
  authenticate,
  authorize("ORGANIZER"),
  eventsController.updateEventStatus,
);
router.delete(
  "/events/:id",
  authenticate,
  authorize("ORGANIZER"),
  eventsController.deleteEvent,
);
router.post(
  "/events/:id/cover",
  authenticate,
  authorize("ORGANIZER"),
  eventsController.uploadSingle,
  eventsController.uploadCover,
);
router.post(
  "/events/:id/images",
  authenticate,
  authorize("ORGANIZER"),
  eventsController.uploadMultiple,
  eventsController.uploadImages,
);
router.delete(
  "/events/:id/images/:imageId",
  authenticate,
  authorize("ORGANIZER"),
  eventsController.deleteImage,
);
router.post(
  "/events/:id/seating-map",
  authenticate,
  authorize("ORGANIZER"),
  eventsController.uploadSingle,
  eventsController.uploadSeatingMap,
);
router.get(
  "/events/:id/stats",
  authenticate,
  authorize("ORGANIZER"),
  eventsController.getEventStats,
);
router.post(
  "/events/:id/ticket-types",
  authenticate,
  authorize("ORGANIZER"),
  eventsController.createTicketType,
);
router.patch(
  "/events/:id/ticket-types/:typeId",
  authenticate,
  authorize("ORGANIZER"),
  eventsController.updateTicketType,
);
router.delete(
  "/events/:id/ticket-types/:typeId",
  authenticate,
  authorize("ORGANIZER"),
  eventsController.deleteTicketType,
);

export default router;
// ThanhBinh