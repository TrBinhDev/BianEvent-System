import { Router, IRouter } from 'express'
import * as adminController from './admin.controller'
import { authenticate } from '../../middlewares/authenticate'
import { authorize } from '../../middlewares/authorize'

const router: IRouter = Router()

router.use(authenticate, authorize('ADMIN'))

router.get('/bookings', adminController.getAllBookings)
router.get('/bookings/:id', adminController.getBookingById)

export default router