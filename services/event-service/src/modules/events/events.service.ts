import { prisma } from '../../config/database'
import { kafkaProducer } from '../../kafka/producer'
import { uploadFile, deleteFile } from '../../storage/r2'
import { AppError } from '../../middlewares/error-handler'
import type {
  CreateEventDto,
  UpdateEventDto,
  UpdateEventStatusDto,
  GetEventsQueryDto,
  CreateTicketTypeDto,
  UpdateTicketTypeDto,
} from './events.dto'

export const getEvents = async (query: GetEventsQueryDto) => {
  const { page, limit, city, categoryId, date, search } = query
  const skip = (page - 1) * limit

  const where: any = {
    status: 'PUBLISHED',
    ...(city && { city }),
    ...(categoryId && { categoryId }),
    ...(search && { title: { contains: search, mode: 'insensitive' } }),
    ...(date && {
      startAt: {
        gte: new Date(date),
        lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      },
    }),
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        category: true,
        ticketTypes: {
          select: {
            id: true,
            name: true,
            price: true,
            availableSlots: true,
            zone: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { startAt: 'asc' },
    }),
    prisma.event.count({ where }),
  ])

  return {
    data: events,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export const getEventById = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id, status: 'PUBLISHED' },
    include: {
      category: true,
      images: { orderBy: { order: 'asc' } },
      ticketTypes: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          totalSlots: true,
          availableSlots: true,
          zone: true,
        },
      },
    },
  })

  if (!event) throw new AppError(404, 'Event không tồn tại')

  return event
}

export const getCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

export const getOrganizerEvents = async (organizerId: string, status?: string) => {
  return prisma.event.findMany({
    where: {
      organizerId,
      ...(status && { status: status as any }),
    },
    include: {
      category: true,
      ticketTypes: {
        select: {
          id: true,
          name: true,
          price: true,
          totalSlots: true,
          availableSlots: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const getOrganizerEventById = async (id: string, organizerId: string) => {
  const event = await prisma.event.findFirst({
    where: { id, organizerId },
    include: {
      category: true,
      images: { orderBy: { order: 'asc' } },
      ticketTypes: true,
    },
  })

  if (!event) throw new AppError(404, 'Event không tồn tại')

  return event
}

export const createEvent = async (organizerId: string, dto: CreateEventDto) => {
  if (new Date(dto.saleStartAt) >= new Date(dto.saleEndAt)) {
    throw new AppError(400, 'Thời gian bắt đầu bán vé phải trước thời gian kết thúc')
  }
  if (new Date(dto.saleEndAt) >= new Date(dto.startAt)) {
    throw new AppError(400, 'Thời gian kết thúc bán vé phải trước thời gian diễn ra')
  }

  return prisma.event.create({
    data: {
      organizerId,
      ...dto,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      saleStartAt: new Date(dto.saleStartAt),
      saleEndAt: new Date(dto.saleEndAt),
    },
  })
}

export const updateEvent = async (id: string, organizerId: string, dto: UpdateEventDto) => {
  const event = await prisma.event.findFirst({ where: { id, organizerId } })
  if (!event) throw new AppError(404, 'Event không tồn tại')

  if (dto.saleStartAt && dto.saleEndAt) {
    if (new Date(dto.saleStartAt) >= new Date(dto.saleEndAt)) {
      throw new AppError(400, 'Thời gian bắt đầu bán vé phải trước thời gian kết thúc')
    }
  }

  return prisma.event.update({
    where: { id },
    data: {
      ...dto,
      ...(dto.startAt && { startAt: new Date(dto.startAt) }),
      ...(dto.endAt && { endAt: new Date(dto.endAt) }),
      ...(dto.saleStartAt && { saleStartAt: new Date(dto.saleStartAt) }),
      ...(dto.saleEndAt && { saleEndAt: new Date(dto.saleEndAt) }),
    },
  })
}

export const updateEventStatus = async (
  id: string,
  organizerId: string,
  dto: UpdateEventStatusDto
) => {
  const event = await prisma.event.findFirst({ where: { id, organizerId } })
  if (!event) throw new AppError(404, 'Event không tồn tại')

  if (event.status === 'CANCELLED') {
    throw new AppError(400, 'Event đã bị huỷ, không thể thay đổi trạng thái')
  }

  await prisma.event.update({
    where: { id },
    data: { status: dto.status },
  })

  if (dto.status === 'PUBLISHED') {
    await kafkaProducer.send({
      topic: 'event.created',
      messages: [
        {
          value: JSON.stringify({
            eventId: event.id,
            organizerId: event.organizerId,
            title: event.title,
            city: event.city,
            startAt: event.startAt,
          }),
        },
      ],
    })
  }

  if (dto.status === 'CANCELLED') {
    const bookedUsers = await getBookedUsers(id)

    await kafkaProducer.send({
      topic: 'event.cancelled',
      messages: [
        {
          value: JSON.stringify({
            eventId: event.id,
            organizerId: event.organizerId,
            title: event.title,
            startAt: event.startAt,
            bookedUserEmails: bookedUsers,
          }),
        },
      ],
    })
  }

  return { message: dto.status === 'PUBLISHED' ? 'Event đã được publish' : 'Event đã bị huỷ' }
}

export const deleteEvent = async (id: string, organizerId: string) => {
  const event = await prisma.event.findFirst({ where: { id, organizerId } })
  if (!event) throw new AppError(404, 'Event không tồn tại')
  if (event.status !== 'DRAFT') throw new AppError(400, 'Chỉ có thể xoá event ở trạng thái DRAFT')

  await prisma.event.delete({ where: { id } })

  return { message: 'Xoá event thành công' }
}

export const uploadCover = async (id: string, organizerId: string, file: Express.Multer.File) => {
  const event = await prisma.event.findFirst({ where: { id, organizerId } })
  if (!event) throw new AppError(404, 'Event không tồn tại')

  if (event.coverUrl) await deleteFile(event.coverUrl)

  const url = await uploadFile(file, 'covers')

  await prisma.event.update({ where: { id }, data: { coverUrl: url } })

  return { coverUrl: url }
}

export const uploadImages = async (id: string, organizerId: string, files: Express.Multer.File[]) => {
  const event = await prisma.event.findFirst({
    where: { id, organizerId },
    include: { images: true },
  })
  if (!event) throw new AppError(404, 'Event không tồn tại')

  if (event.images.length + files.length > 10) {
    throw new AppError(400, `Chỉ được upload tối đa 10 ảnh, hiện có ${event.images.length} ảnh`)
  }

  const urls = await Promise.all(files.map((f) => uploadFile(f, 'events')))

  await prisma.eventImage.createMany({
    data: urls.map((url, i) => ({
      eventId: id,
      url,
      order: event.images.length + i,
    })),
  })

  return { message: 'Upload ảnh thành công' }
}

export const deleteImage = async (id: string, imageId: string, organizerId: string) => {
  const image = await prisma.eventImage.findFirst({
    where: { id: imageId, eventId: id },
    include: { event: true },
  })

  if (!image) throw new AppError(404, 'Ảnh không tồn tại')
  if (image.event.organizerId !== organizerId) throw new AppError(403, 'Không có quyền xoá ảnh này')

  await deleteFile(image.url)
  await prisma.eventImage.delete({ where: { id: imageId } })

  return { message: 'Xoá ảnh thành công' }
}

export const uploadSeatingMap = async (id: string, organizerId: string, file: Express.Multer.File) => {
  const event = await prisma.event.findFirst({ where: { id, organizerId } })
  if (!event) throw new AppError(404, 'Event không tồn tại')

  if (event.seatingMapUrl) await deleteFile(event.seatingMapUrl)

  const url = await uploadFile(file, 'seating-maps')

  await prisma.event.update({ where: { id }, data: { seatingMapUrl: url } })

  return { seatingMapUrl: url }
}

export const getEventStats = async (id: string, organizerId: string) => {
  const event = await prisma.event.findFirst({
    where: { id, organizerId },
    include: { ticketTypes: true },
  })

  if (!event) throw new AppError(404, 'Event không tồn tại')

  const stats = event.ticketTypes.map((tt) => ({
    ticketTypeId: tt.id,
    name: tt.name,
    totalSlots: tt.totalSlots,
    availableSlots: tt.availableSlots,
    soldSlots: tt.totalSlots - tt.availableSlots,
    revenue: (tt.totalSlots - tt.availableSlots) * Number(tt.price),
  }))

  return {
    eventId: id,
    title: event.title,
    totalRevenue: stats.reduce((sum, s) => sum + s.revenue, 0),
    ticketTypes: stats,
  }
}

export const createTicketType = async (eventId: string, organizerId: string, dto: CreateTicketTypeDto) => {
  const event = await prisma.event.findFirst({ where: { id: eventId, organizerId } })
  if (!event) throw new AppError(404, 'Event không tồn tại')

  return prisma.ticketType.create({
    data: {
      eventId,
      ...dto,
      availableSlots: dto.totalSlots,
    },
  })
}

export const updateTicketType = async (
  eventId: string,
  typeId: string,
  organizerId: string,
  dto: UpdateTicketTypeDto
) => {
  const ticketType = await prisma.ticketType.findFirst({
    where: { id: typeId, eventId },
    include: { event: true },
  })

  if (!ticketType) throw new AppError(404, 'Loại vé không tồn tại')
  if (ticketType.event.organizerId !== organizerId) throw new AppError(403, 'Không có quyền sửa loại vé này')

  return prisma.ticketType.update({
    where: { id: typeId },
    data: dto,
  })
}

export const deleteTicketType = async (eventId: string, typeId: string, organizerId: string) => {
  const ticketType = await prisma.ticketType.findFirst({
    where: { id: typeId, eventId },
    include: { event: true },
  })

  if (!ticketType) throw new AppError(404, 'Loại vé không tồn tại')
  if (ticketType.event.organizerId !== organizerId) throw new AppError(403, 'Không có quyền xoá loại vé này')
  if (ticketType.availableSlots !== ticketType.totalSlots) {
    throw new AppError(400, 'Không thể xoá loại vé đã có người đặt')
  }

  await prisma.ticketType.delete({ where: { id: typeId } })

  return { message: 'Xoá loại vé thành công' }
}

const getBookedUsers = async (eventId: string) => {
  return []
}