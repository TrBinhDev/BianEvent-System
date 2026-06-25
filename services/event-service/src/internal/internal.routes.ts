import { Router, IRouter } from 'express'
import * as internalController from './internal.controller'
import { internalAuth } from '../middlewares/internal'

const router: IRouter = Router()

router.use(internalAuth)

router.get('/events/:id', internalController.getEventById)
router.get('/ticket-types/:id', internalController.getTicketTypeById)
router.patch('/ticket-types/:id/slots/decrement', internalController.decrementSlots)
router.patch('/ticket-types/:id/slots/increment', internalController.incrementSlots)

export default router