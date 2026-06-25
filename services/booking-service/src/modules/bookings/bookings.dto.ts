import { z } from 'zod'

export const createBookingDto = z.object({
  ticketTypeId: z.string().uuid('ticketTypeId không hợp lệ'),
  quantity: z
    .number()
    .int()
    .min(1, 'Số lượng vé tối thiểu là 1')
    .max(4, 'Mỗi lần đặt tối đa 4 vé'),
})

export const getBookingsQueryDto = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('10').transform(Number),
  status: z.enum(['PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED']).optional(),
})

export type CreateBookingDto = z.infer<typeof createBookingDto>
export type GetBookingsQueryDto = z.infer<typeof getBookingsQueryDto>