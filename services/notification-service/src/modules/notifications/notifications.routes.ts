import { Router, IRouter } from 'express'
import * as notificationsController from './notifications.controller'
import { authenticate } from '../../middlewares/authenticate'

const router: IRouter = Router()

router.use(authenticate)

router.get('/', notificationsController.getNotifications)
router.get('/unread-count', notificationsController.getUnreadCount)
router.patch('/:id/read', notificationsController.markAsRead)
router.patch('/read-all', notificationsController.markAllAsRead)

export default router