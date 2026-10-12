import { z } from 'zod'
import { GoogleAuthProviderError } from '@/modules/user/errors/google-auth-provider.error'
import { InvalidGoogleTokenError } from '@/modules/user/errors/invalid-google-token.error'

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
    let response: Response
    try {
      response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: AbortSignal.timeout(5000),
      })
    } catch {
      throw new GoogleAuthProviderError(
        503,
        'Google authentication service is unavailable.'
      )
    }

    if (response.status === 401) {
      throw new InvalidGoogleTokenError(
        'Could not verify Google authentication.'
      )
    }

    if (!response.ok) {
      const statusCode =
        response.status === 429 || response.status >= 500 ? 503 : 502
      throw new GoogleAuthProviderError(statusCode)
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch (error) {
      const statusCode = error instanceof SyntaxError ? 502 : 503
      throw new GoogleAuthProviderError(
        statusCode,
        statusCode === 502
          ? 'Google authentication service returned an invalid response.'
          : 'Google authentication service is unavailable.'
      )
    }

    const parsedPayload = googleUserInfoSchema.safeParse(payload)
    if (!parsedPayload.success) {
      throw new GoogleAuthProviderError(
        502,
        'Google authentication service returned an invalid response.'
      )
    }

    return parsedPayload.data
  }
}
