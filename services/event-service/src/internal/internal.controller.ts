import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AppError } from "../middlewares/error-handler";

export const getEventById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        status: true,
        saleStartAt: true,
        saleEndAt: true,
        startAt: true,
        endAt: true,
        title: true,
        organizerId: true,
      },
    });

    if (!event) throw new AppError(404, "Event không tồn tại");

    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

export const getTicketTypeById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketType = await prisma.ticketType.findUnique({
      where: { id: req.params.id },
      include: {
        event: {
          select: {
            status: true,
            saleStartAt: true,
            saleEndAt: true,
            title: true,
          },
        },
      },
    });

    if (!ticketType) throw new AppError(404, "Loại vé không tồn tại");

    res.json({ success: true, data: ticketType });
  } catch (err) {
    next(err);
  }
};

export const decrementSlots = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { quantity } = req.body;
    const { id } = req.params;

    const result = await prisma.$executeRaw`
      UPDATE ticket_types
      SET available_slots = available_slots - ${quantity}
      WHERE id = ${id} AND available_slots >= ${quantity}
    `;

    if (result === 0) throw new AppError(400, "Không đủ slot");

    res.json({ success: true, message: "Trừ slot thành công" });
  } catch (err) {
    next(err);
  }
};

export const incrementSlots = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { quantity } = req.body;
    const { id } = req.params;

    await prisma.$executeRaw`
      UPDATE ticket_types
      SET available_slots = available_slots + ${quantity}
      WHERE id = ${id}
    `;

    res.json({ success: true, message: "Hoàn slot thành công" });
  } catch (err) {
    next(err);
  }
};
