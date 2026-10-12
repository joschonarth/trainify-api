import { z } from 'zod'

export const userProfileSchema = z.object({
  id: z.string().describe('User ID.'),
  name: z.string().describe('User name.'),
  email: z.email().describe('User email.'),
  avatarUrl: z.string().nullable().describe('User avatar URL.'),
  height: z.number().nullable().describe('User height in centimeters.'),
  weight: z.number().nullable().describe('User weight in kilograms.'),
  gender: z
    .enum(['male', 'female', 'other'])
    .nullable()
    .describe('User gender.'),
  birthdate: z.iso.datetime().nullable().describe('User birthdate.'),
  createdAt: z.iso.datetime().describe('Account creation date.'),
})
