import { z } from 'zod'

const isWithinBcryptByteLimit = (password: string) =>
  new TextEncoder().encode(password).byteLength <= 72

export const passwordSchema = z
  .string()
  .min(10)
  .max(72)
  .refine(isWithinBcryptByteLimit, {
    error: 'Password must not exceed 72 UTF-8 bytes.',
  })

export const currentPasswordSchema = z
  .string()
  .min(6)
  .max(72)
  .refine(isWithinBcryptByteLimit, {
    error: 'Password must not exceed 72 UTF-8 bytes.',
  })
