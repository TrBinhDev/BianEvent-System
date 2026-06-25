import { Kafka } from 'kafkajs'
import { env } from '../config/env'

const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: env.KAFKA_BROKERS.split(','),
})

export const kafkaProducer = kafka.producer()

export const connectProducer = async () => {
  await kafkaProducer.connect()
  console.log('Kafka producer connected')
}

export const disconnectProducer = async () => {
  await kafkaProducer.disconnect()
  console.log('Kafka producer disconnected')
}