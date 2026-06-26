import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { z } from 'zod'

const envSchema = z.object({
  PORT: z.string().default('3003'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string(),

  REDIS_URL: z.string(),

  KAFKA_BROKERS: z.string(),
  KAFKA_CLIENT_ID: z.string(),
  KAFKA_GROUP_ID: z.string(),

  INTERNAL_API_KEY: z.string(),

  JWT_ACCESS_SECRET: z.string(),

  EVENT_SERVICE_URL: z.string(),
  USER_SERVICE_URL: z.string(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data