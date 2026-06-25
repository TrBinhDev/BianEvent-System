import { Router, IRouter } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { authenticate } from '../middlewares/authenticate'
import { authorize } from '../middlewares/authorize'
import { env } from '../config/env'

const router: IRouter = Router()

const proxy = createProxyMiddleware({
  target: env.EVENT_SERVICE_URL,
  changeOrigin: true,
})

// Public
router.get('/events', proxy)
router.get('/events/categories', proxy)
router.get('/events/:id', proxy)

// Organizer
router.get('/organizer/events', authenticate, authorize('ORGANIZER'), proxy)
router.post('/organizer/events', authenticate, authorize('ORGANIZER'), proxy)
router.get('/organizer/events/:id', authenticate, authorize('ORGANIZER'), proxy)
router.patch('/organizer/events/:id', authenticate, authorize('ORGANIZER'), proxy)
router.patch('/organizer/events/:id/status', authenticate, authorize('ORGANIZER'), proxy)
router.delete('/organizer/events/:id', authenticate, authorize('ORGANIZER'), proxy)
router.post('/organizer/events/:id/cover', authenticate, authorize('ORGANIZER'), proxy)
router.post('/organizer/events/:id/images', authenticate, authorize('ORGANIZER'), proxy)
router.delete('/organizer/events/:id/images/:imageId', authenticate, authorize('ORGANIZER'), proxy)
router.post('/organizer/events/:id/seating-map', authenticate, authorize('ORGANIZER'), proxy)
router.get('/organizer/events/:id/stats', authenticate, authorize('ORGANIZER'), proxy)
router.post('/organizer/events/:id/ticket-types', authenticate, authorize('ORGANIZER'), proxy)
router.patch('/organizer/events/:id/ticket-types/:typeId', authenticate, authorize('ORGANIZER'), proxy)
router.delete('/organizer/events/:id/ticket-types/:typeId', authenticate, authorize('ORGANIZER'), proxy)

// Admin
router.get('/admin/events', authenticate, authorize('ADMIN'), proxy)
router.patch('/admin/events/:id/status', authenticate, authorize('ADMIN'), proxy)
router.get('/admin/categories', authenticate, authorize('ADMIN'), proxy)
router.post('/admin/categories', authenticate, authorize('ADMIN'), proxy)
router.patch('/admin/categories/:id', authenticate, authorize('ADMIN'), proxy)
router.delete('/admin/categories/:id', authenticate, authorize('ADMIN'), proxy)

export default router