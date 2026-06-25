import { Kafka } from 'kafkajs'
import { env } from '../config/env'
import { handleUserRegistered, handleOrganizerApproved } from './handlers/user.handler'
import { handleNotificationSend } from './handlers/notification.handler'
import { handleEventCancelled } from './handlers/event.handler'
import { handleBookingConfirmed, handleBookingFailed } from './handlers/booking.handler'

const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: env.KAFKA_BROKERS.split(','),
})

const consumer = kafka.consumer({ groupId: env.KAFKA_GROUP_ID })

export const connectConsumer = async () => {
  await consumer.connect()
  console.log('Kafka consumer connected')

  await consumer.subscribe({
    topics: [
      'user.registered',
      'user.organizer_approved',
      'notification.send',
      'event.cancelled',
      'booking.confirmed',
      'booking.failed',
    ],
    fromBeginning: false,
  })

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const payload = JSON.parse(message.value?.toString() || '{}')

        switch (topic) {
          case 'user.registered':
            await handleUserRegistered(payload)
            break
          case 'user.organizer_approved':
            await handleOrganizerApproved(payload)
            break
          case 'notification.send':
            await handleNotificationSend(payload)
            break
          case 'event.cancelled':
            await handleEventCancelled(payload)
            break
          case 'booking.confirmed':
            await handleBookingConfirmed(payload)
            break
          case 'booking.failed':
            await handleBookingFailed(payload)
            break
          default:
            console.log(`Unknown topic: ${topic}`)
        }
      } catch (err) {
        console.error(`Error processing message from topic ${topic}:`, err)
      }
    },
  })
}

export const disconnectConsumer = async () => {
  await consumer.disconnect()
  console.log('Kafka consumer disconnected')
}