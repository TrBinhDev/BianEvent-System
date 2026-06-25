import { prisma } from '../../config/database'
import axios from 'axios'
import { env } from '../../config/env'

interface EventCancelledPayload {
  eventId: string
  title: string
  startAt: string
  bookedUserEmails: { userId: string; email: string; fullName: string }[]
}

export const handleEventCancelled = async (payload: EventCancelledPayload) => {
  const { eventId } = payload

  const bookings = await prisma.booking.findMany({
    where: { eventId, status: 'CONFIRMED' },
    include: { tickets: true },
  })

  if (bookings.length === 0) return

  for (const booking of bookings) {
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' },
      }),
      prisma.ticket.updateMany({
        where: { bookingId: booking.id },
        data: { status: 'CANCELLED' },
      }),
      prisma.bookingStatusLog.create({
        data: {
          bookingId: booking.id,
          fromStatus: 'CONFIRMED',
          toStatus: 'CANCELLED',
          reason: 'Event bị huỷ',
        },
      }),
    ])

    await axios.patch(
      `${env.EVENT_SERVICE_URL}/internal/ticket-types/${booking.ticketTypeId}/slots/increment`,
      { quantity: booking.quantity },
      { headers: { 'x-internal-key': env.INTERNAL_API_KEY } }
    )
  }

  console.log(`Cancelled ${bookings.length} bookings for event ${eventId}`)
}