import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { connectProducer, disconnectProducer } from './kafka/producer'
import { errorHandler } from './middlewares/error-handler'
import eventsRoutes from './modules/events/events.routes'
import adminRoutes from './modules/admin/admin.routes'
import internalRoutes from './internal/internal.routes'
import organizerRoutes from './modules/events/organizer.routes'

const app = express()

app.use(cors({
  origin: ['http://localhost:4000', 'http://localhost:4001'],
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/events', eventsRoutes)
app.use('/api/organizer', organizerRoutes)  
app.use('/api/admin', adminRoutes)
app.use('/internal', internalRoutes)

app.use(errorHandler)

const start = async () => {
  try {
    await connectProducer()
    app.listen(env.PORT, () => {
      console.log(`Event Service running on port ${env.PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

const shutdown = async () => {
  console.log('Shutting down...')
  await disconnectProducer()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

start()