import { renderAsync } from '@react-email/components'
import { BookingConfirmedEmail } from '../../email/templates/BookingConfirmedEmail'
import { BookingFailedEmail } from '../../email/templates/BookingFailedEmail'
import { sendEmail } from '../../email/resend'
import { prisma } from '../../config/database'
import { getIO } from '../../socket/socket'
import axios from 'axios'
import { env } from '../../config/env'
import QRCode from 'qrcode'
import React from 'react'

interface BookingConfirmedPayload {
  bookingId: string
  userId: string
  email: string
  fullName: string
  eventTitle: string
  ticketTypeName: string
  zone: string
  quantity: number
  totalAmount: number
  startAt: string
  venueName: string
  tickets: { ticketId: string }[]
}

interface BookingFailedPayload {
  userId: string
  email: string
  fullName: string
  eventTitle: string
  reason: string
}

export const handleBookingConfirmed = async (payload: BookingConfirmedPayload) => {
  const {
    bookingId,
    userId,
    email,
    fullName,
    eventTitle,
    ticketTypeName,
    zone,
    startAt,
    venueName,
    tickets,
  } = payload

  // Lấy thêm thông tin user nếu cần
  // Gửi email riêng cho từng ticket
  for (const ticket of tickets) {
    const qrCodeBase64 = await QRCode.toDataURL(ticket.ticketId)

    const html = await renderAsync(
      React.createElement(BookingConfirmedEmail, {
        fullName,
        eventTitle,
        ticketTypeName,
        zone: zone || 'Chung',
        startAt,
        venueName,
        ticketId: ticket.ticketId,
        qrCodeBase64,
      })
    )

    await sendEmail(email, `Xác nhận vé: ${eventTitle}`, html)
  }

  // Lưu notification
  await prisma.notification.create({
    data: {
      userId,
      title: 'Đặt vé thành công',
      body: `Bạn đã đặt thành công ${tickets.length} vé cho sự kiện "${eventTitle}".`,
      type: 'BOOKING_CONFIRMED',
    },
  })

  // Emit socket
  try {
    const io = getIO()

    io.to(`user:${userId}`).emit('booking_confirmed', {
      bookingId,
      eventTitle,
      quantity: tickets.length,
    })

    io.to(`event:${payload.bookingId}`).emit('slot_updated', {
      eventTitle,
    })

    io.to(`user:${userId}`).emit('new_notification', {
      title: 'Đặt vé thành công',
      body: `Bạn đã đặt thành công ${tickets.length} vé cho sự kiện "${eventTitle}".`,
      type: 'BOOKING_CONFIRMED',
    })
  } catch (err) {
    console.error('Socket emit error:', err)
  }
}

export const handleBookingFailed = async (payload: BookingFailedPayload) => {
  const { userId, email, fullName, eventTitle, reason } = payload

  const html = await renderAsync(
    React.createElement(BookingFailedEmail, {
      fullName,
      eventTitle,
      reason,
    })
  )

  await sendEmail(email, `Đặt vé không thành công: ${eventTitle}`, html)

  await prisma.notification.create({
    data: {
      userId,
      title: 'Đặt vé không thành công',
      body: `Yêu cầu đặt vé cho sự kiện "${eventTitle}" không thành công. Lý do: ${reason}`,
      type: 'BOOKING_FAILED',
    },
  })

  try {
    const io = getIO()

    io.to(`user:${userId}`).emit('booking_failed', {
      eventTitle,
      reason,
    })

    io.to(`user:${userId}`).emit('new_notification', {
      title: 'Đặt vé không thành công',
      body: `Yêu cầu đặt vé cho sự kiện "${eventTitle}" không thành công.`,
      type: 'BOOKING_FAILED',
    })
  } catch (err) {
    console.error('Socket emit error:', err)
  }
}