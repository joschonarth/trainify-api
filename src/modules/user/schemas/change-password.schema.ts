import { z } from 'zod'
import { currentPasswordSchema, passwordSchema } from './password.schema'

export const changePasswordBodySchema = z.object({
  currentPassword: currentPasswordSchema,
  newPassword: passwordSchema,
  passwordConfirmation: passwordSchema,
})

export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>
