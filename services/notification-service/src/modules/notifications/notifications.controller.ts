import { Response, NextFunction } from 'express'
import * as notificationsService from './notifications.service'
import { AuthRequest } from '../../middlewares/authenticate'
import { z } from 'zod'

const queryDto = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('10').transform(Number),
  isRead: z.string().optional().transform((v) => {
    if (v === 'true') return true
    if (v === 'false') return false
    return undefined
  }),
})

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, isRead } = queryDto.parse(req.query)
    const result = await notificationsService.getNotifications(req.user!.userId, page, limit, isRead)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await notificationsService.getUnreadCount(req.user!.userId)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await notificationsService.markAsRead(req.user!.userId, req.params.id)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await notificationsService.markAllAsRead(req.user!.userId)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}