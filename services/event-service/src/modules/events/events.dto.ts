import { z } from 'zod'

export const createEventDto = z.object({
  title: z.string().min(1, 'Tên event không được để trống'),
  description: z.string().optional(),
  categoryId: z.string().uuid('categoryId không hợp lệ').optional(),
  venueName: z.string().min(1, 'Tên địa điểm không được để trống'),
  address: z.string().min(1, 'Địa chỉ không được để trống'),
  city: z.string().min(1, 'Thành phố không được để trống'),
  lat: z.number().optional(),
  lng: z.number().optional(),
  startAt: z.string().datetime('Thời gian bắt đầu không hợp lệ'),
  endAt: z.string().datetime('Thời gian kết thúc không hợp lệ'),
  saleStartAt: z.string().datetime('Thời gian bắt đầu bán vé không hợp lệ'),
  saleEndAt: z.string().datetime('Thời gian kết thúc bán vé không hợp lệ'),
})

export const updateEventDto = createEventDto.partial()

export const updateEventStatusDto = z.object({
  status: z.enum(['PUBLISHED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status không hợp lệ' }),
  }),
})

export const getEventsQueryDto = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('10').transform(Number),
  city: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  date: z.string().optional(),
  search: z.string().optional(),
})

export const createTicketTypeDto = z.object({
  name: z.string().min(1, 'Tên loại vé không được để trống'),
  description: z.string().optional(),
  price: z.number().min(0, 'Giá vé không được âm'),
  totalSlots: z.number().int().min(1, 'Số lượng vé tối thiểu là 1'),
  zone: z.string().optional(),
})

export const updateTicketTypeDto = createTicketTypeDto.partial()

export type CreateEventDto = z.infer<typeof createEventDto>
export type UpdateEventDto = z.infer<typeof updateEventDto>
export type UpdateEventStatusDto = z.infer<typeof updateEventStatusDto>
export type GetEventsQueryDto = z.infer<typeof getEventsQueryDto>
export type CreateTicketTypeDto = z.infer<typeof createTicketTypeDto>
export type UpdateTicketTypeDto = z.infer<typeof updateTicketTypeDto>