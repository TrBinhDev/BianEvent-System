import { prisma } from '../../config/database'
import { AppError } from '../../middlewares/error-handler'

export const getNotifications = async (
  userId: string,
  page: number,
  limit: number,
  isRead?: boolean
) => {
  const skip = (page - 1) * limit

  const where = {
    userId,
    ...(isRead !== undefined && { isRead }),
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
  ])

  return {
    data: notifications,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export const getUnreadCount = async (userId: string) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  })

  return { count }
}

export const markAsRead = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  })

  if (!notification) throw new AppError(404, 'Thông báo không tồn tại')

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  })

  return { message: 'Đã đánh dấu đã đọc' }
}

export const markAllAsRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })

  return { message: 'Đã đánh dấu tất cả đã đọc' }
}