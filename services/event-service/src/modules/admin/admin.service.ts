import { prisma } from '../../config/database'
import { AppError } from '../../middlewares/error-handler'

export const getAllEvents = async (status?: string) => {
  return prisma.event.findMany({
    where: { ...(status && { status: status as any }) },
    include: {
      category: true,
      ticketTypes: {
        select: {
          id: true,
          name: true,
          totalSlots: true,
          availableSlots: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const updateEventStatus = async (id: string, status: 'PUBLISHED' | 'CANCELLED') => {
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) throw new AppError(404, 'Event không tồn tại')

  await prisma.event.update({
    where: { id },
    data: { status },
  })

  return { message: 'Cập nhật trạng thái event thành công' }
}

export const getCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

export const createCategory = async (name: string) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-')

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) throw new AppError(409, 'Category đã tồn tại')

  return prisma.category.create({ data: { name, slug } })
}

export const updateCategory = async (id: string, name: string) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-')

  await prisma.category.update({
    where: { id },
    data: { name, slug },
  })

  return { message: 'Cập nhật category thành công' }
}

export const deleteCategory = async (id: string) => {
  const eventsCount = await prisma.event.count({ where: { categoryId: id } })
  if (eventsCount > 0) {
    throw new AppError(400, 'Không thể xoá category đang có event')
  }

  await prisma.category.delete({ where: { id } })

  return { message: 'Xoá category thành công' }
}

// ThanhBinh