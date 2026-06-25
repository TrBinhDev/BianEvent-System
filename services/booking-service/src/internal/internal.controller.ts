import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { AppError } from '../middlewares/error-handler'

export const getBookingsByEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.params

    const bookings = await prisma.booking.findMany({
      where: { eventId, status: 'CONFIRMED' },
      include: {
        tickets: { select: { id: true } },
      },
    })

    res.json({ success: true, data: bookings })
  } catch (err) {
    next(err)
  }
}