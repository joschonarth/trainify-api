import { z } from 'zod'
import { passwordSchema } from './password.schema'

export const registerBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().transform((email) => email.trim().toLowerCase()),
  password: passwordSchema,
  passwordConfirmation: passwordSchema,
})

export type RegisterBody = z.infer<typeof registerBodySchema>
