import { Router, IRouter } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { authenticate } from '../middlewares/authenticate'
import { env } from '../config/env'

const router: IRouter = Router()

const proxy = createProxyMiddleware({
  target: env.NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
})

router.get('/notifications', authenticate, proxy)
router.get('/notifications/unread-count', authenticate, proxy)
router.patch('/notifications/:id/read', authenticate, proxy)
router.patch('/notifications/read-all', authenticate, proxy)

export default router