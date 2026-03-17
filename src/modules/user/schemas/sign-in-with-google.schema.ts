import { z } from 'zod'

export const signInWithGoogleBodySchema = z.object({
  token: z
    .string()
    .describe('Google OAuth ID token obtained from the Google Sign-In flow.'),
})

export type SignInWithGoogleBody = z.infer<typeof signInWithGoogleBodySchema>
