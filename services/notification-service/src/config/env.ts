import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { z } from 'zod'

const envSchema = z.object({
  PORT: z.string().default('3004'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string(),

  KAFKA_BROKERS: z.string(),
  KAFKA_CLIENT_ID: z.string(),
  KAFKA_GROUP_ID: z.string(),

  RESEND_API_KEY: z.string(),
  RESEND_FROM_EMAIL: z.string(),

  JWT_ACCESS_SECRET: z.string(),
  INTERNAL_API_KEY: z.string(),

  USER_SERVICE_URL: z.string(),
  WEB_URL: z.string().default('http://localhost:4000'),
  DASHBOARD_URL: z.string().default('http://localhost:4001'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data