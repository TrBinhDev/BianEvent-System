import { Router, IRouter } from 'express'
import * as eventsController from './events.controller'
import { authenticate } from '../../middlewares/authenticate'
import { authorize } from '../../middlewares/authorize'

const router: IRouter = Router()

// Public
router.get('/', eventsController.getEvents)
router.get('/categories', eventsController.getCategories)

// Organizer
router.get('/organizer/events', authenticate, authorize('ORGANIZER'), eventsController.getOrganizerEvents)
router.post('/organizer/events', authenticate, authorize('ORGANIZER'), eventsController.createEvent)
router.get('/organizer/events/:id', authenticate, authorize('ORGANIZER'), eventsController.getOrganizerEventById)
router.patch('/organizer/events/:id', authenticate, authorize('ORGANIZER'), eventsController.updateEvent)
router.patch('/organizer/events/:id/status', authenticate, authorize('ORGANIZER'), eventsController.updateEventStatus)
router.delete('/organizer/events/:id', authenticate, authorize('ORGANIZER'), eventsController.deleteEvent)
router.post('/organizer/events/:id/cover', authenticate, authorize('ORGANIZER'), eventsController.uploadSingle, eventsController.uploadCover)
router.post('/organizer/events/:id/images', authenticate, authorize('ORGANIZER'), eventsController.uploadMultiple, eventsController.uploadImages)
router.delete('/organizer/events/:id/images/:imageId', authenticate, authorize('ORGANIZER'), eventsController.deleteImage)
router.post('/organizer/events/:id/seating-map', authenticate, authorize('ORGANIZER'), eventsController.uploadSingle, eventsController.uploadSeatingMap)
router.get('/organizer/events/:id/stats', authenticate, authorize('ORGANIZER'), eventsController.getEventStats)
router.post('/organizer/events/:id/ticket-types', authenticate, authorize('ORGANIZER'), eventsController.createTicketType)
router.patch('/organizer/events/:id/ticket-types/:typeId', authenticate, authorize('ORGANIZER'), eventsController.updateTicketType)
router.delete('/organizer/events/:id/ticket-types/:typeId', authenticate, authorize('ORGANIZER'), eventsController.deleteTicketType)

router.get('/:id', eventsController.getEventById)

export default router