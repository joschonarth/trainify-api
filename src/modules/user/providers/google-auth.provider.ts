import { z } from 'zod'

const googleUserInfoSchema = z.object({
  email: z.email(),
  verified_email: z.boolean(),
  name: z.string().optional(),
  picture: z.url().optional(),
})

export type GoogleUserInfo = z.infer<typeof googleUserInfoSchema>

export interface GoogleAuthProvider {
  getUserInfo(accessToken: string): Promise<GoogleUserInfo>
}

export class GoogleUserInfoProvider implements GoogleAuthProvider {
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Google user info request failed.')
    }

    const payload: unknown = await response.json()
    return googleUserInfoSchema.parse(payload)
  }
}
