import { renderAsync } from '@react-email/components'
import { OtpEmail } from '../../email/templates/OtpEmail'
import { OrganizerApprovedEmail } from '../../email/templates/OrganizerApprovedEmail'
import { sendEmail } from '../../email/resend'
import { prisma } from '../../config/database'
import { env } from '../../config/env'
import React from 'react'

interface UserRegisteredPayload {
  userId: string
  email: string
  fullName: string
  otp: string
}

interface OrganizerApprovedPayload {
  userId: string
  email: string
  fullName: string
}

export const handleUserRegistered = async (payload: UserRegisteredPayload) => {
  const { email, fullName, otp } = payload

  const html = await renderAsync(
    React.createElement(OtpEmail, { fullName, otp })
  )

  await sendEmail(email, 'Xác thực tài khoản BianEvent', html)
}

export const handleOrganizerApproved = async (payload: OrganizerApprovedPayload) => {
  const { userId, email, fullName } = payload

  const html = await renderAsync(
    React.createElement(OrganizerApprovedEmail, {
      fullName,
      dashboardUrl: env.DASHBOARD_URL,
    })
  )

  await sendEmail(email, 'Đơn đăng ký Organizer đã được duyệt', html)

  await prisma.notification.create({
    data: {
      userId,
      title: 'Đơn đăng ký Organizer đã được duyệt',
      body: 'Chúc mừng! Bạn đã trở thành Organizer trên BianEvent.',
      type: 'ORGANIZER_APPROVED',
    },
  })
}