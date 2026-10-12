import { z } from 'zod'

export const registerBodySchema = z.object({
  name: z.string(),
  email: z.email().transform((email) => email.trim().toLowerCase()),
  password: z.string().min(10),
  passwordConfirmation: z.string().min(10),
})

export type RegisterBody = z.infer<typeof registerBodySchema>
