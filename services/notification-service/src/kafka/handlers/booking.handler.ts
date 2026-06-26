import { renderAsync } from "@react-email/components";
import { BookingConfirmedEmail } from "../../email/templates/BookingConfirmedEmail";
import { BookingFailedEmail } from "../../email/templates/BookingFailedEmail";
import { sendEmail, sendEmailWithAttachment } from "../../email/resend"; // ✅ Import thêm
import { prisma } from "../../config/database";
import { getIO } from "../../socket/socket";
import axios from "axios";
import { env } from "../../config/env";
import QRCode from "qrcode";
import React from "react";

interface BookingConfirmedPayload {
  bookingId: string;
  userId: string;
  eventId: string;
  email?: string;
  fullName?: string;
  eventTitle: string;
  ticketTypeName: string;
  zone: string;
  quantity: number;
  totalAmount: number;
  startAt: string;
  venueName: string;
  tickets: { ticketId: string }[];
}

interface BookingFailedPayload {
  userId: string;
  email?: string;
  fullName?: string;
  eventTitle: string;
  reason: string;
}

export const handleBookingConfirmed = async (
  payload: BookingConfirmedPayload,
) => {
  let {
    bookingId,
    userId,
    eventId,
    email,
    fullName,
    eventTitle,
    ticketTypeName,
    zone,
    quantity,
    startAt,
    venueName,
    tickets,
  } = payload;

  console.log(
    "📦 handleBookingConfirmed payload:",
    JSON.stringify(payload, null, 2),
  );

  // ✅ Nếu không có email hoặc fullName, gọi API sang User service
  if (!email || !fullName) {
    console.log(
      `📧 Missing email/fullName, fetching from User service for userId: ${userId}`,
    );

    try {
      const url = `${env.USER_SERVICE_URL}/internal/users/${userId}`;
      console.log(`🔗 Calling: ${url}`);

      const userRes = await axios.get(url, {
        headers: {
          "x-internal-key": env.INTERNAL_API_KEY,
        },
      });

      const userData = userRes.data.data;
      email = email || userData?.email;
      fullName = fullName || userData?.fullName;

      console.log(`✅ Fetched user: ${email} - ${fullName}`);
    } catch (userError: any) {
      console.error(`❌ Failed to fetch user ${userId}:`, {
        message: userError.message,
        status: userError.response?.status,
        data: userError.response?.data,
      });
    }
  }

  if (!email) {
    console.error(
      "❌ Cannot send email: email is undefined for userId:",
      userId,
    );
    return;
  }

  // ✅ Gửi email riêng cho từng ticket với QR Code attachment
  for (const ticket of tickets) {
    try {
      // ✅ Tạo QR Code dưới dạng Buffer
      const qrBuffer = await QRCode.toBuffer(ticket.ticketId, {
        width: 200,
        margin: 2,
        color: {
          dark: "#3d2f1f",
          light: "#ffffff",
        },
      });

      // ✅ Render HTML email (không có QR code trong HTML)
      const html = await renderAsync(
        React.createElement(BookingConfirmedEmail, {
          fullName: fullName || "Quý khách",
          eventTitle,
          ticketTypeName,
          zone: zone || "Chung",
          startAt,
          venueName,
          ticketId: ticket.ticketId,
        }),
      );

      // ✅ Gửi email với QR Code dưới dạng attachment
      await sendEmailWithAttachment(email, `Xác nhận vé: ${eventTitle}`, html, {
        filename: `ticket-${ticket.ticketId.slice(0, 8)}.png`,
        content: qrBuffer,
        contentType: "image/png",
      });

      console.log(`✅ Email sent to ${email} for ticket ${ticket.ticketId}`);
    } catch (emailError) {
      console.error(
        `❌ Failed to send email for ticket ${ticket.ticketId}:`,
        emailError,
      );
    }
  }

  // Lưu notification
  try {
    await prisma.notification.create({
      data: {
        userId,
        title: "Đặt vé thành công",
        body: `Bạn đã đặt thành công ${tickets.length} vé cho sự kiện "${eventTitle}".`,
        type: "BOOKING_CONFIRMED",
      },
    });
  } catch (dbError) {
    console.error("❌ Failed to save notification:", dbError);
  }

  // Emit socket
  try {
    const io = getIO();

    io.to(`user:${userId}`).emit("booking_confirmed", {
      bookingId,
      eventTitle,
      quantity: tickets.length,
    });

    io.to(`event:${eventId}`).emit("slot_updated", {
      eventTitle,
      ticketTypeName,
      quantity,
    });

    io.to(`user:${userId}`).emit("new_notification", {
      title: "Đặt vé thành công",
      body: `Bạn đã đặt thành công ${tickets.length} vé cho sự kiện "${eventTitle}".`,
      type: "BOOKING_CONFIRMED",
    });
  } catch (socketError) {
    console.error("❌ Socket emit error:", socketError);
  }
};

export const handleBookingFailed = async (payload: BookingFailedPayload) => {
  let { userId, email, fullName, eventTitle, reason } = payload;

  console.log(
    "📦 handleBookingFailed payload:",
    JSON.stringify(payload, null, 2),
  );

  // ✅ Nếu không có email hoặc fullName, gọi API sang User service
  if (!email || !fullName) {
    console.log(
      `📧 Missing email/fullName, fetching from User service for userId: ${userId}`,
    );

    try {
      const url = `${env.USER_SERVICE_URL}/internal/users/${userId}`;
      console.log(`🔗 Calling: ${url}`);

      const userRes = await axios.get(url, {
        headers: {
          "x-internal-key": env.INTERNAL_API_KEY,
        },
      });

      const userData = userRes.data.data;
      email = email || userData?.email;
      fullName = fullName || userData?.fullName;

      console.log(`✅ Fetched user: ${email} - ${fullName}`);
    } catch (userError: any) {
      console.error(`❌ Failed to fetch user ${userId}:`, {
        message: userError.message,
        status: userError.response?.status,
        data: userError.response?.data,
      });
    }
  }

  if (!email) {
    console.error(
      "❌ Cannot send email: email is undefined for userId:",
      userId,
    );
    return;
  }

  // ✅ Gửi email thông báo thất bại
  try {
    const html = await renderAsync(
      React.createElement(BookingFailedEmail, {
        fullName: fullName || "Quý khách",
        eventTitle,
        reason,
      }),
    );

    await sendEmail(email, `Đặt vé không thành công: ${eventTitle}`, html);
    console.log(`✅ Email sent to ${email}`);
  } catch (emailError) {
    console.error("❌ Failed to send email:", emailError);
  }

  // Lưu notification
  try {
    await prisma.notification.create({
      data: {
        userId,
        title: "Đặt vé không thành công",
        body: `Yêu cầu đặt vé cho sự kiện "${eventTitle}" không thành công. Lý do: ${reason}`,
        type: "BOOKING_FAILED",
      },
    });
  } catch (dbError) {
    console.error("❌ Failed to save notification:", dbError);
  }

  // Emit socket
  try {
    const io = getIO();

    io.to(`user:${userId}`).emit("booking_failed", {
      eventTitle,
      reason,
    });

    io.to(`user:${userId}`).emit("new_notification", {
      title: "Đặt vé không thành công",
      body: `Yêu cầu đặt vé cho sự kiện "${eventTitle}" không thành công.`,
      type: "BOOKING_FAILED",
    });
  } catch (socketError) {
    console.error("❌ Socket emit error:", socketError);
  }
};
