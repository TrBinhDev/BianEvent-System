import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'

let io: Server

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:4000', 'http://localhost:4001'],
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    // User join room theo userId
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`)
      console.log(`Socket ${socket.id} joined room user:${userId}`)
    })

    // User join room theo eventId khi xem trang chi tiết event
    socket.on('join:event', (eventId: string) => {
      socket.join(`event:${eventId}`)
      console.log(`Socket ${socket.id} joined room event:${eventId}`)
    })

    // User leave room event khi rời trang
    socket.on('leave:event', (eventId: string) => {
      socket.leave(`event:${eventId}`)
      console.log(`Socket ${socket.id} left room event:${eventId}`)
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}