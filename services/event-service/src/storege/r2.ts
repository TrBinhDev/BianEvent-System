import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../config/env'
import { randomUUID } from 'crypto'

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
})

export const uploadFile = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  const ext = file.originalname.split('.').pop()
  const key = `${folder}/${randomUUID()}.${ext}`

  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  )

  return `${env.R2_PUBLIC_URL}/${key}`
}

export const deleteFile = async (url: string): Promise<void> => {
  const key = url.replace(`${env.R2_PUBLIC_URL}/`, '')

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    })
  )
}