import { Router, IRouter } from 'express'
import * as bookingsController from './bookings.controller'
import { authenticate } from '../../middlewares/authenticate'
import { authorize } from '../../middlewares/authorize'

const router: IRouter = Router()

router.post('/', authenticate, authorize('USER'), bookingsController.createBooking)
router.get('/my', authenticate, bookingsController.getMyBookings)
router.get('/my/:id', authenticate, bookingsController.getMyBookingById)

export default router