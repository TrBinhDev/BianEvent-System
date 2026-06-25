import { prisma } from '../../config/database'
import { redis } from '../../config/redis'
import { hashPassword, comparePassword } from '../../utils/hash'
import { kafkaProducer } from '../../kafka/producer'
import { AppError } from '../../middlewares/error-handler'
import type { UpdateProfileDto, ChangePasswordDto, ApplyOrganizerDto } from './users.dto'

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      status: true,
      createdAt: true,
    },
  })

  if (!user) throw new AppError(404, 'Người dùng không tồn tại')

  return user
}

export const updateProfile = async (userId: string, dto: UpdateProfileDto) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(dto.fullName && { fullName: dto.fullName }),
      ...(dto.avatarUrl && { avatarUrl: dto.avatarUrl }),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true,
    },
  })

  return user
}

export const changePassword = async (userId: string, dto: ChangePasswordDto) => {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError(404, 'Người dùng không tồn tại')

  const isMatch = await comparePassword(dto.oldPassword, user.passwordHash)
  if (!isMatch) throw new AppError(400, 'Mật khẩu cũ không đúng')

  if (dto.oldPassword === dto.newPassword) {
    throw new AppError(400, 'Mật khẩu mới không được trùng mật khẩu cũ')
  }

  const passwordHash = await hashPassword(dto.newPassword)

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  })

  return { message: 'Đổi mật khẩu thành công' }
}

export const applyOrganizer = async (userId: string, dto: ApplyOrganizerDto) => {
  const existing = await prisma.organizerApplication.findUnique({
    where: { userId },
  })

  if (existing) {
    if (existing.status === 'PENDING') {
      throw new AppError(400, 'Bạn đã có đơn đang chờ duyệt')
    }
    if (existing.status === 'APPROVED') {
      throw new AppError(400, 'Bạn đã là Organizer')
    }
    // REJECTED thì cho apply lại
    await prisma.organizerApplication.update({
      where: { userId },
      data: {
        organization: dto.organization,
        description: dto.description,
        contactPhone: dto.contactPhone,
        status: 'PENDING',
        reviewedBy: null,
        reviewedAt: null,
      },
    })

    return { message: 'Đã gửi lại đơn đăng ký Organizer, vui lòng chờ duyệt' }
  }

  await prisma.organizerApplication.create({
    data: {
      userId,
      organization: dto.organization,
      description: dto.description,
      contactPhone: dto.contactPhone,
    },
  })

  return { message: 'Đã gửi đơn đăng ký Organizer, vui lòng chờ duyệt' }
}