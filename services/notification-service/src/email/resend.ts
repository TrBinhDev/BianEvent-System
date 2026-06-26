import { Resend } from "resend";
import { env } from "../config/env";

export const resend = new Resend(env.RESEND_API_KEY);

// ✅ Hàm gửi email không attachment (giữ nguyên)
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err);
    throw err;
  }
};

// ✅ Hàm mới: gửi email với attachment
export const sendEmailWithAttachment = async (
  to: string,
  subject: string,
  html: string,
  attachment: {
    filename: string;
    content: Buffer;
    contentType: string;
  },
) => {
  try {
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
      attachments: [
        {
          filename: attachment.filename,
          content: attachment.content,
          content_type: attachment.contentType, 
        },
      ],
    });
    console.log(`✅ Email with attachment sent to ${to}`);
  } catch (err) {
    console.error(`❌ Failed to send email with attachment to ${to}:`, err);
    throw err;
  }
};
