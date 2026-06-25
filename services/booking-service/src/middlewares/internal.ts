import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'
import { AppError } from './error-handler'

export const internalAuth = (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['x-internal-key']
  if (!key || key !== env.INTERNAL_API_KEY) {
    return next(new AppError(403, 'Forbidden'))
  }
  next()
}