import { Router, IRouter } from 'express'
import * as adminController from './admin.controller'
import { authenticate } from '../../middlewares/authenticate'
import { authorize } from '../../middlewares/authorize'

const router: IRouter = Router()

router.use(authenticate, authorize('ADMIN'))

router.get('/users', adminController.getUsers)
router.get('/users/:id', adminController.getUserById)
router.patch('/users/:id/role', adminController.updateUserRole)
router.patch('/users/:id/status', adminController.updateUserStatus)

router.get('/organizer-applications', adminController.getOrganizerApplications)
router.patch('/organizer-applications/:id/approve', adminController.approveApplication)
router.patch('/organizer-applications/:id/reject', adminController.rejectApplication)

export default router