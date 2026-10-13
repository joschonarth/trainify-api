import { z } from 'zod'
import { GoogleAuthProviderError } from '@/modules/user/errors/google-auth-provider.error'
import { InvalidGoogleTokenError } from '@/modules/user/errors/invalid-google-token.error'

const googleUserInfoSchema = z.object({
  email: z.email(),
  verified_email: z.boolean(),
  name: z.string().optional(),
  picture: z.url().optional(),
})

const googleTokenInfoSchema = z.object({
  aud: z.string().optional(),
  azp: z.string().optional(),
  audience: z.string().optional(),
  issued_to: z.string().optional(),
})

export type GoogleUserInfo = z.infer<typeof googleUserInfoSchema>

export interface GoogleAuthProvider {
  getUserInfo(accessToken: string): Promise<GoogleUserInfo>
}

export class GoogleUserInfoProvider implements GoogleAuthProvider {
  constructor(private readonly clientId: string) {}

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const signal = AbortSignal.timeout(5000)
    const tokenInfoUrl = new URL('https://oauth2.googleapis.com/tokeninfo')
    tokenInfoUrl.searchParams.set('access_token', accessToken)

    const tokenInfoPayload = await fetchGoogleJson(
      tokenInfoUrl.toString(),
      signal
    )
    const tokenInfo = googleTokenInfoSchema.safeParse(tokenInfoPayload)
    if (!tokenInfo.success) {
      throw new GoogleAuthProviderError(
        502,
        'Google authentication service returned an invalid response.'
      )
    }

    const audiences = [
      tokenInfo.data.aud,
      tokenInfo.data.azp,
      tokenInfo.data.audience,
      tokenInfo.data.issued_to,
    ].filter((value): value is string => Boolean(value))

    if (audiences.length === 0) {
      throw new GoogleAuthProviderError(
        502,
        'Google authentication service returned an invalid response.'
      )
    }

    if (audiences.some((audience) => audience !== this.clientId)) {
      throw new InvalidGoogleTokenError(
        'Google token was not issued for this application.'
      )
    }

    const userInfoPayload = await fetchGoogleJson(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      signal,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const userInfo = googleUserInfoSchema.safeParse(userInfoPayload)
    if (!userInfo.success) {
      throw new GoogleAuthProviderError(
        502,
        'Google authentication service returned an invalid response.'
      )
    }

    return userInfo.data
  }
}

async function fetchGoogleJson(
  url: string,
  signal: AbortSignal,
  init?: RequestInit
): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(url, { ...init, signal })
  } catch {
    throw new GoogleAuthProviderError(
      503,
      'Google authentication service is unavailable.'
    )
  }

  if (response.status === 400 || response.status === 401) {
    throw new InvalidGoogleTokenError('Could not verify Google authentication.')
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

  return payload
}
