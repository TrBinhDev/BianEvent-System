import { prisma } from '../../config/database'
import { redis } from '../../config/redis'
import { kafkaProducer } from '../../kafka/producer'
import { AppError } from '../../middlewares/error-handler'
import type { UpdateUserRoleDto, UpdateUserStatusDto, GetUsersQueryDto, GetApplicationsQueryDto } from './admin.dto'

export const getUsers = async (query: GetUsersQueryDto) => {
  const { page, limit, role, status } = query
  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(status && { status }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({
      where: {
        ...(role && { role }),
        ...(status && { status }),
      },
    }),
  ])

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      status: true,
      createdAt: true,
      organizerApplication: true,
    },
  })

  if (!user) throw new AppError(404, 'Người dùng không tồn tại')

  return user
}

export const updateUserRole = async (id: string, dto: UpdateUserRoleDto) => {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new AppError(404, 'Người dùng không tồn tại')

  await prisma.user.update({
    where: { id },
    data: { role: dto.role },
  })

  return { message: 'Cập nhật role thành công' }
}

export const updateUserStatus = async (id: string, dto: UpdateUserStatusDto) => {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new AppError(404, 'Người dùng không tồn tại')

  await prisma.user.update({
    where: { id },
    data: { status: dto.status },
  })

  if (dto.status === 'BANNED') {
    await redis.set(`banned:${id}`, '1')
    await prisma.refreshToken.deleteMany({ where: { userId: id } })
  } else {
    await redis.del(`banned:${id}`)
  }

  return { message: dto.status === 'BANNED' ? 'Đã khoá tài khoản' : 'Đã mở khoá tài khoản' }
}

export const getOrganizerApplications = async (query: GetApplicationsQueryDto) => {
  const { page, limit, status } = query
  const skip = (page - 1) * limit

  const [applications, total] = await Promise.all([
    prisma.organizerApplication.findMany({
      where: { ...(status && { status }) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.organizerApplication.count({
      where: { ...(status && { status }) },
    }),
  ])

  return {
    data: applications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export const approveApplication = async (id: string, adminId: string) => {
  const application = await prisma.organizerApplication.findUnique({ where: { id } })
  if (!application) throw new AppError(404, 'Đơn không tồn tại')
  if (application.status !== 'PENDING') throw new AppError(400, 'Đơn đã được xử lý')

  await prisma.$transaction([
    prisma.organizerApplication.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: application.userId },
      data: { role: 'ORGANIZER' },
    }),
  ])

  const user = await prisma.user.findUnique({ where: { id: application.userId } })

  await kafkaProducer.send({
    topic: 'user.organizer_approved',
    messages: [
      {
        value: JSON.stringify({
          userId: user!.id,
          email: user!.email,
          fullName: user!.fullName,
        }),
      },
    ],
  })

  return { message: 'Đã duyệt đơn Organizer' }
}

export const rejectApplication = async (id: string, adminId: string) => {
  const application = await prisma.organizerApplication.findUnique({ where: { id } })
  if (!application) throw new AppError(404, 'Đơn không tồn tại')
  if (application.status !== 'PENDING') throw new AppError(400, 'Đơn đã được xử lý')

  await prisma.organizerApplication.update({
    where: { id },
    data: {
      status: 'REJECTED',
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
  })

  return { message: 'Đã từ chối đơn Organizer' }
}