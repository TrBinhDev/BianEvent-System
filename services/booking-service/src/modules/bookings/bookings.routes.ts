import { Router, IRouter } from "express";
import * as bookingsController from "./bookings.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router: IRouter = Router();

router.post(
  "/",
  authenticate,
  authorize("USER"),
  bookingsController.createBooking,
);
router.get("/my", authenticate, bookingsController.getMyBookings);
router.get("/my/:id", authenticate, bookingsController.getMyBookingById);
router.get(
  "/organizer/events/:eventId/bookings",
  authenticate,
  authorize("ORGANIZER"),
  bookingsController.getEventBookings,
);
router.patch(
  "/tickets/:ticketId/checkin",
  authenticate,
  authorize("ORGANIZER"),
  bookingsController.checkinTicket,
);

export default router;
