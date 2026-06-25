import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const SALT_ROUNDS = 12

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

export const hashSHA256 = (value: string): string => {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export const compareSHA256 = (value: string, hash: string): boolean => {
  return hashSHA256(value) === hash
}