import { renderAsync } from '@react-email/components'
import { EventCancelledEmail } from '../../email/templates/EventCancelledEmail'
import { sendEmail } from '../../email/resend'
import { prisma } from '../../config/database'
import { getIO } from '../../socket/socket'
import React from 'react'

interface EventCancelledPayload {
  eventId: string
  title: string
  startAt: string
  bookedUserEmails: {
    userId: string
    email: string
    fullName: string
  }[]
}

export const handleEventCancelled = async (payload: EventCancelledPayload) => {
  const { eventId, title, startAt, bookedUserEmails } = payload

  if (!bookedUserEmails || bookedUserEmails.length === 0) return

  for (const user of bookedUserEmails) {
    const html = await renderAsync(
      React.createElement(EventCancelledEmail, {
        fullName: user.fullName,
        eventTitle: title,
        startAt,
      })
    )

    await sendEmail(user.email, `Thông báo huỷ sự kiện: ${title}`, html)

    await prisma.notification.create({
      data: {
        userId: user.userId,
        title: 'Sự kiện đã bị huỷ',
        body: `Sự kiện "${title}" đã bị huỷ.`,
        type: 'EVENT_CANCELLED',
      },
    })

    try {
      const io = getIO()
      io.to(`user:${user.userId}`).emit('new_notification', {
        title: 'Sự kiện đã bị huỷ',
        body: `Sự kiện "${title}" đã bị huỷ.`,
        type: 'EVENT_CANCELLED',
      })
    } catch (err) {
      console.error('Socket emit error:', err)
    }
  }
}