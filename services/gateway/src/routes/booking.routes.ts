import { Router, IRouter } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { authenticate } from '../middlewares/authenticate'
import { authorize } from '../middlewares/authorize'
import { env } from '../config/env'

const router: IRouter = Router()

const proxy = createProxyMiddleware({
  target: env.BOOKING_SERVICE_URL,
  changeOrigin: true,
})

// User
router.post('/bookings', authenticate, authorize('USER'), proxy)
router.get('/bookings/my', authenticate, proxy)
router.get('/bookings/my/:id', authenticate, proxy)

// Admin
router.get('/admin/bookings', authenticate, authorize('ADMIN'), proxy)
router.get('/admin/bookings/:id', authenticate, authorize('ADMIN'), proxy)

export default router