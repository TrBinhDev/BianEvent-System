import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { redis } from '../config/redis'
import { verifyAccessToken } from '../utils/token'
import { AppError } from '../middlewares/error-handler'

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
      },
    })

    if (!user) throw new AppError(404, 'Người dùng không tồn tại')

    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Token không hợp lệ')
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)

    const isBanned = await redis.get(`banned:${payload.sub}`)
    if (isBanned) throw new AppError(403, 'Tài khoản đã bị khoá')

    res.json({
      success: true,
      data: {
        userId: payload.sub,
        role: payload.role,
      },
    })
  } catch (err) {
    next(err)
  }
}