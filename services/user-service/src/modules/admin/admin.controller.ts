import { Response, NextFunction } from 'express'
import * as adminService from './admin.service'
import { updateUserRoleDto, updateUserStatusDto, getUsersQueryDto, getApplicationsQueryDto } from './admin.dto'
import { AuthRequest } from '../../middlewares/authenticate'

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = getUsersQueryDto.parse(req.query)
    const result = await adminService.getUsers(query)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getUserById(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = updateUserRoleDto.parse(req.body)
    const result = await adminService.updateUserRole(req.params.id, body)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = updateUserStatusDto.parse(req.body)
    const result = await adminService.updateUserStatus(req.params.id, body)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const getOrganizerApplications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = getApplicationsQueryDto.parse(req.query)
    const result = await adminService.getOrganizerApplications(query)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const approveApplication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.approveApplication(req.params.id, req.user!.userId)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const rejectApplication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.rejectApplication(req.params.id, req.user!.userId)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}