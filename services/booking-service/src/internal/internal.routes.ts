import { Router, IRouter } from 'express'
import * as internalController from './internal.controller'
import { internalAuth } from '../middlewares/internal'

const router: IRouter = Router()

router.use(internalAuth)

router.get('/bookings/by-event/:eventId', internalController.getBookingsByEvent)

export default router