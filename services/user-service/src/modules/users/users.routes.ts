import { Router, IRouter } from 'express'
import * as usersController from './users.controller'
import { authenticate } from '../../middlewares/authenticate'
import { authorize } from '../../middlewares/authorize'

const router: IRouter = Router()

router.get('/me', authenticate, usersController.getMe)
router.patch('/me', authenticate, usersController.updateProfile)
router.patch('/me/password', authenticate, usersController.changePassword)
router.post('/me/apply-organizer', authenticate, authorize('USER'), usersController.applyOrganizer)

export default router