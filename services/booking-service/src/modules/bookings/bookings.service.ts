import { prisma } from "../../config/database";
import { redis } from "../../config/redis";
import { kafkaProducer } from "../../kafka/producer";
import { AppError } from "../../middlewares/error-handler";
import axios from "axios";
import { env } from "../../config/env";
import type { CreateBookingDto, GetBookingsQueryDto } from "./bookings.dto";

const LOCK_TTL = 300; // 5 phút
const IDEMPOTENCY_TTL = 10; // 10 giây
const MAX_TICKETS_PER_EVENT = 4;

const eventServiceApi = axios.create({
  baseURL: env.EVENT_SERVICE_URL,
  headers: { "x-internal-key": env.INTERNAL_API_KEY },
});

export const createBooking = async (userId: string, dto: CreateBookingDto) => {
  const { ticketTypeId, quantity } = dto;

  // 1. Idempotency check
  const idempotencyKey = `booking:idempotency:${userId}:${ticketTypeId}`;
  const isDuplicate = await redis.set(
    idempotencyKey,
    "1",
    "EX",
    IDEMPOTENCY_TTL,
    "NX",
  );
  if (!isDuplicate)
    throw new AppError(429, "Yêu cầu đang được xử lý, vui lòng chờ");

  // 2. Gọi Event Service validate ticket type
  const { data: ticketTypeRes } = await eventServiceApi.get(
    `/internal/ticket-types/${ticketTypeId}`,
  );
  const ticketType = ticketTypeRes.data;

  // 3. Validate event status và sale window
  if (ticketType.event.status !== "PUBLISHED") {
    throw new AppError(400, "Event không còn nhận đặt vé");
  }

  const now = new Date();
  if (now < new Date(ticketType.event.saleStartAt)) {
    throw new AppError(400, "Chưa đến thời gian mở bán vé");
  }
  if (now > new Date(ticketType.event.saleEndAt)) {
    throw new AppError(400, "Đã hết thời gian bán vé");
  }

  // 4. Kiểm tra tổng vé user đã đặt cho event này
  const userEventKey = `booking:user-event:${userId}:${ticketType.eventId}`;
  const currentTotal = parseInt((await redis.get(userEventKey)) || "0");
  if (currentTotal + quantity > MAX_TICKETS_PER_EVENT) {
    throw new AppError(
      400,
      `Bạn chỉ được đặt tối đa ${MAX_TICKETS_PER_EVENT} vé cho mỗi event`,
    );
  }

  // 5. Redis seat lock
  const lockKey = `lock:ticket:${ticketTypeId}:${userId}`;
  const locked = await redis.set(lockKey, "1", "EX", LOCK_TTL, "NX");
  if (!locked) throw new AppError(409, "Vé đang được xử lý, vui lòng thử lại");

  let booking = null;
  let slotDecremented = false;

  try {
    // 6. Trừ slot ở Event Service
    await eventServiceApi.patch(
      `/internal/ticket-types/${ticketTypeId}/slots/decrement`,
      { quantity },
    );
    slotDecremented = true;

    // 7. Tạo booking + tickets + log
    const totalAmount = Number(ticketType.price) * quantity;

    booking = await prisma.$transaction(
      async (tx: {
        booking: {
          create: (arg0: {
            data: {
              userId: string;
              eventId: any;
              ticketTypeId: string;
              quantity: number;
              totalAmount: number;
              status: string;
            };
          }) => any;
        };
        ticket: {
          createMany: (arg0: {
            data: { bookingId: any; userId: string; eventId: any }[];
          }) => any;
        };
        bookingStatusLog: {
          create: (arg0: {
            data: { bookingId: any; toStatus: string; reason: string };
          }) => any;
        };
      }) => {
        const newBooking = await tx.booking.create({
          data: {
            userId,
            eventId: ticketType.eventId,
            ticketTypeId,
            quantity,
            totalAmount,
            status: "CONFIRMED",
          },
        });

        await tx.ticket.createMany({
          data: Array.from({ length: quantity }, () => ({
            bookingId: newBooking.id,
            userId,
            eventId: ticketType.eventId,
          })),
        });

        await tx.bookingStatusLog.create({
          data: {
            bookingId: newBooking.id,
            toStatus: "CONFIRMED",
            reason: "Đặt vé thành công",
          },
        });

        return newBooking;
      },
    );

    // 8. Cập nhật tổng vé user đã đặt cho event
    await redis.incrby(userEventKey, quantity);
    await redis.expire(userEventKey, 60 * 60 * 24 * 30); // 30 ngày

    // 9. Lấy danh sách tickets vừa tạo
    const tickets = await prisma.ticket.findMany({
      where: { bookingId: booking.id },
      select: { id: true },
    });

    // 10. Publish booking.confirmed
    await kafkaProducer.send({
      topic: "booking.confirmed",
      messages: [
        {
          value: JSON.stringify({
            bookingId: booking.id,
            userId,
            eventTitle: ticketType.event.title,
            ticketTypeName: ticketType.name,
            zone: ticketType.zone,
            quantity,
            totalAmount,
            startAt: ticketType.event.startAt,
            tickets: tickets.map((t: { id: any }) => ({ ticketId: t.id })),
          }),
        },
      ],
    });

    return { bookingId: booking.id, message: "Đặt vé thành công" };
  } catch (err) {
    // Rollback slot nếu đã trừ
    if (slotDecremented) {
      await eventServiceApi.patch(
        `/internal/ticket-types/${ticketTypeId}/slots/increment`,
        { quantity },
      );
    }

    // Publish booking.failed
    await kafkaProducer.send({
      topic: "booking.failed",
      messages: [
        {
          value: JSON.stringify({
            userId,
            eventTitle: ticketType?.event?.title || "Unknown",
            reason: err instanceof AppError ? err.message : "Lỗi hệ thống",
          }),
        },
      ],
    });

    if (err instanceof AppError) throw err;
    throw new AppError(500, "Đặt vé thất bại, vui lòng thử lại");
  } finally {
    // Luôn xoá lock dù thành công hay thất bại
    await redis.del(lockKey);
  }
};

export const getMyBookings = async (
  userId: string,
  query: GetBookingsQueryDto,
) => {
  const { page, limit, status } = query;
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { userId, ...(status && { status }) },
      include: {
        tickets: { select: { id: true, status: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where: { userId, ...(status && { status }) } }),
  ]);

  return {
    data: bookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getMyBookingById = async (userId: string, bookingId: string) => {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: {
      tickets: true,
      statusLogs: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!booking) throw new AppError(404, "Booking không tồn tại");

  return booking;
};

export const checkinTicket = async (ticketId: string, organizerId: string) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      booking: true,
    },
  });

  if (!ticket) throw new AppError(404, "Vé không tồn tại");
  if (ticket.status === "USED") throw new AppError(400, "Vé đã được sử dụng");
  if (ticket.status === "CANCELLED") throw new AppError(400, "Vé đã bị huỷ");

  // Check ticket thuộc event của organizer này
  // Gọi Event Service lấy thông tin event
  const { data: eventRes } = await eventServiceApi.get(
    `/internal/events/${ticket.eventId}`,
  );
  const event = eventRes.data;

  if (event.organizerId !== organizerId) {
    throw new AppError(403, "Bạn không có quyền check-in vé này");
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: "USED" },
  });

  return { message: "Check-in thành công" };
};
