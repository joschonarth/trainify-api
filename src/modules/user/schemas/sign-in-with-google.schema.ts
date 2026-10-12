import { z } from 'zod'

export const signInWithGoogleBodySchema = z.object({
  token: z
    .string()
    .describe('Google OAuth access token used to retrieve verified user info.'),
})

export type SignInWithGoogleBody = z.infer<typeof signInWithGoogleBodySchema>
