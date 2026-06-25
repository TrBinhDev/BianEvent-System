import { Request, Response, NextFunction, RequestHandler } from 'express'
import * as eventsService from './events.service'
import {
  createEventDto,
  updateEventDto,
  updateEventStatusDto,
  getEventsQueryDto,
  createTicketTypeDto,
  updateTicketTypeDto,
} from './events.dto'
import { AuthRequest } from '../../middlewares/authenticate'
import multer from 'multer'

const upload = multer({ storage: multer.memoryStorage() })

export const uploadSingle: RequestHandler = upload.single('file')
export const uploadMultiple: RequestHandler = upload.array('files', 10)

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getEventsQueryDto.parse(req.query)
    const result = await eventsService.getEvents(query)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await eventsService.getEventById(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await eventsService.getCategories()
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const getOrganizerEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query
    const result = await eventsService.getOrganizerEvents(req.user!.userId, status as string)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const getOrganizerEventById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await eventsService.getOrganizerEventById(req.params.id, req.user!.userId)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = createEventDto.parse(req.body)
    const result = await eventsService.createEvent(req.user!.userId, body)
    res.status(201).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = updateEventDto.parse(req.body)
    const result = await eventsService.updateEvent(req.params.id, req.user!.userId, body)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const updateEventStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = updateEventStatusDto.parse(req.body)
    const result = await eventsService.updateEventStatus(req.params.id, req.user!.userId, body)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await eventsService.deleteEvent(req.params.id, req.user!.userId)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const uploadCover = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new Error('Vui lòng chọn file')
    const result = await eventsService.uploadCover(req.params.id, req.user!.userId, req.file)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const uploadImages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) throw new Error('Vui lòng chọn file')
    const result = await eventsService.uploadImages(req.params.id, req.user!.userId, files)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const deleteImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await eventsService.deleteImage(req.params.id, req.params.imageId, req.user!.userId)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const uploadSeatingMap = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new Error('Vui lòng chọn file')
    const result = await eventsService.uploadSeatingMap(req.params.id, req.user!.userId, req.file)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export const getEventStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await eventsService.getEventStats(req.params.id, req.user!.userId)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const createTicketType = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = createTicketTypeDto.parse(req.body)
    const result = await eventsService.createTicketType(req.params.id, req.user!.userId, body)
    res.status(201).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const updateTicketType = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = updateTicketTypeDto.parse(req.body)
    const result = await eventsService.updateTicketType(req.params.id, req.params.typeId, req.user!.userId, body)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const deleteTicketType = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await eventsService.deleteTicketType(req.params.id, req.params.typeId, req.user!.userId)
    res.json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}