import { renderAsync } from '@react-email/components'
import { ResetPasswordEmail } from '../../email/templates/ResetPasswordEmail'
import { sendEmail } from '../../email/resend'
import React from 'react'

interface NotificationSendPayload {
  to: string
  type: 'RESET_PASSWORD'
  data: {
    resetLink: string
  }
}

export const handleNotificationSend = async (payload: NotificationSendPayload) => {
  const { to, type, data } = payload

  if (type === 'RESET_PASSWORD') {
    const html = await renderAsync(
      React.createElement(ResetPasswordEmail, {
        fullName: '',
        resetLink: data.resetLink,
      })
    )

    await sendEmail(to, 'Đặt lại mật khẩu BianEvent', html)
  }
}