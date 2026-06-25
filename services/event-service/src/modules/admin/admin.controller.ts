import { Request, Response, NextFunction } from 'express'
import * as adminService from './admin.service'
import { z } from 'zod'

const categoryDto = z.object({
  name: z.string().min(1, 'Tên category không được để trống'),
})

const statusDto = z.object({
  status: z.enum(['PUBLISHED', 'CANCELLED']),
})

export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query
    const result = await adminService.getAllEvents(status as string)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const updateEventStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = statusDto.parse(req.body)
    const result = await adminService.updateEventStatus(req.params.id, status)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getCategories()
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = categoryDto.parse(req.body)
    const result = await adminService.createCategory(name)
    res.status(201).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = categoryDto.parse(req.body)
    const result = await adminService.updateCategory(req.params.id, name)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.deleteCategory(req.params.id)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}