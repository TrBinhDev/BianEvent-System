import { Resend } from 'resend'
import { env } from '../config/env'

export const resend = new Resend(env.RESEND_API_KEY)

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  try {
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    })
    console.log(`Email sent to ${to}`)
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err)
    throw err
  }
}