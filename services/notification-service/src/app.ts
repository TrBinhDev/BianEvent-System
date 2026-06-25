import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import http from 'http'
import { env } from './config/env'
import { connectConsumer, disconnectConsumer } from './kafka/consumer'
import { initSocket } from './socket/socket'
import { errorHandler } from './middlewares/error-handler'
import notificationsRoutes from './modules/notifications/notifications.routes'

const app = express()
const httpServer = http.createServer(app)

app.use(cors({
  origin: ['http://localhost:4000', 'http://localhost:4001'],
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/notifications', notificationsRoutes)

app.use(errorHandler)

const start = async () => {
  try {
    initSocket(httpServer)
    await connectConsumer()
    httpServer.listen(env.PORT, () => {
      console.log(`Notification Service running on port ${env.PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

const shutdown = async () => {
  console.log('Shutting down...')
  await disconnectConsumer()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

start()