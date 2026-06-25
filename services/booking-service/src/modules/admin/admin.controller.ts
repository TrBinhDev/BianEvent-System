import { Request, Response, NextFunction } from 'express'
import * as adminService from './admin.service'
import { z } from 'zod'

const queryDto = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('10').transform(Number),
  status: z.enum(['PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED']).optional(),
  eventId: z.string().uuid().optional(),
})

export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, eventId } = queryDto.parse(req.query)
    const result = await adminService.getAllBookings(page, limit, status, eventId)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getBookingById(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}