import { Response, NextFunction } from 'express'
import { AuthRequest } from './authenticate'
import { AppError } from './error-handler'

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Vui lòng đăng nhập'))
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Bạn không có quyền thực hiện hành động này'))
    }

    next()
  }
}