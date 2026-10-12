import { z } from 'zod'

export const authenticateBodySchema = z.object({
  email: z.email().transform((email) => email.trim().toLowerCase()),
  password: z.string().min(6),
})

export type AuthenticateBody = z.infer<typeof authenticateBodySchema>
