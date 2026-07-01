import { prisma } from '../../config/database'
import { AppError } from '../../middlewares/error-handler'

export const getAllBookings = async (page: number, limit: number, status?: string, eventId?: string) => {
  const skip = (page - 1) * limit

  const where: any = {
    ...(status && { status }),
    ...(eventId && { eventId }),
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        tickets: { select: { id: true, status: true } },
        statusLogs: { orderBy: { createdAt: 'asc' } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.count({ where }),
  ])

  return {
    data: bookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export const getBookingById = async (id: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      tickets: true,
      statusLogs: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!booking) throw new AppError(404, 'Booking không tồn tại')

  return booking
}
// ThanhBinh