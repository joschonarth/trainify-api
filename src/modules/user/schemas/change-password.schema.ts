import { z } from 'zod'

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
  passwordConfirmation: z.string().min(6),
})

export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>
