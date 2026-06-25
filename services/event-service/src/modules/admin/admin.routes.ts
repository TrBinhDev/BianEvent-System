import { Router, IRouter } from 'express'
import * as adminController from './admin.controller'
import { authenticate } from '../../middlewares/authenticate'
import { authorize } from '../../middlewares/authorize'

const router: IRouter = Router()

router.use(authenticate, authorize('ADMIN'))

router.get('/events', adminController.getAllEvents)
router.patch('/events/:id/status', adminController.updateEventStatus)

router.get('/categories', adminController.getCategories)
router.post('/categories', adminController.createCategory)
router.patch('/categories/:id', adminController.updateCategory)
router.delete('/categories/:id', adminController.deleteCategory)

export default router