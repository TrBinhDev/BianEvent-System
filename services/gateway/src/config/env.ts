import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { z } from 'zod'

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  USER_SERVICE_URL: z.string(),
  EVENT_SERVICE_URL: z.string(),
  BOOKING_SERVICE_URL: z.string(),
  NOTIFICATION_SERVICE_URL: z.string(),

  INTERNAL_API_KEY: z.string(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data