import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/token'
import { AppError } from './error-handler'
import { redis } from '../config/redis'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    role: string
  }
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Vui lòng đăng nhập')
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)

    const isBanned = await redis.get(`banned:${payload.sub}`)
    if (isBanned) {
      throw new AppError(403, 'Tài khoản đã bị khoá')
    }

    req.user = {
      userId: payload.sub,
      role: payload.role,
    }

    next()
  } catch (err) {
    if (err instanceof AppError) return next(err)
    next(new AppError(401, 'Token không hợp lệ hoặc đã hết hạn'))
  }
}