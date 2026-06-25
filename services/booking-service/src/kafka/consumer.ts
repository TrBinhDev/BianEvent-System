import { Kafka } from 'kafkajs'
import { env } from '../config/env'
import { handleEventCancelled } from './handlers/event.handler'

const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: env.KAFKA_BROKERS.split(','),
})

const consumer = kafka.consumer({ groupId: env.KAFKA_GROUP_ID })

export const connectConsumer = async () => {
  await consumer.connect()
  console.log('Kafka consumer connected')

  await consumer.subscribe({ topic: 'event.cancelled', fromBeginning: false })

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const payload = JSON.parse(message.value?.toString() || '{}')

        if (topic === 'event.cancelled') {
          await handleEventCancelled(payload)
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