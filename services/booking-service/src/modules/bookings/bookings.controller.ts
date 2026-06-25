import { Response, NextFunction } from 'express'
import * as bookingsService from './bookings.service'
import { createBookingDto, getBookingsQueryDto } from './bookings.dto'
import { AuthRequest } from '../../middlewares/authenticate'

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = createBookingDto.parse(req.body)
    const result = await bookingsService.createBooking(req.user!.userId, body)
    res.status(201).json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = getBookingsQueryDto.parse(req.query)
    const result = await bookingsService.getMyBookings(req.user!.userId, query)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const getMyBookingById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await bookingsService.getMyBookingById(req.user!.userId, req.params.id)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}