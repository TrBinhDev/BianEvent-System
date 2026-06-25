import { Response, NextFunction } from 'express'
import * as usersService from './users.service'
import { updateProfileDto, changePasswordDto, applyOrganizerDto } from './users.dto'
import { AuthRequest } from '../../middlewares/authenticate'

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await usersService.getMe(req.user!.userId)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = updateProfileDto.parse(req.body)
    const result = await usersService.updateProfile(req.user!.userId, body)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = changePasswordDto.parse(req.body)
    const result = await usersService.changePassword(req.user!.userId, body)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const applyOrganizer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = applyOrganizerDto.parse(req.body)
    const result = await usersService.applyOrganizer(req.user!.userId, body)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}