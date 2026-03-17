import { z } from 'zod'

export const registerBodySchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
  passwordConfirmation: z.string().min(6),
})

export type RegisterBody = z.infer<typeof registerBodySchema>
