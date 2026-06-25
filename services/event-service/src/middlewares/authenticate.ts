import { Request, Response, NextFunction } from 'express'
import { AppError } from './error-handler'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface AuthRequest extends Request {
  user?: {
    userId: string
    role: string
  }
}

interface TokenPayload {
  sub: string
  role: string
}

export const authenticate = (
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
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload

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