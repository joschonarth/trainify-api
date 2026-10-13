import { afterEach, describe, expect, it, vi } from 'vitest'

import { InvalidGoogleTokenError } from '@/modules/user/errors/invalid-google-token.error'

import { GoogleUserInfoProvider } from './google-auth.provider'

const CLIENT_ID = 'trainify-client-id'

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('GoogleUserInfoProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns user info when the token audience matches the client', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ aud: CLIENT_ID }))
      .mockResolvedValueOnce(
        jsonResponse({
          email: 'user@example.com',
          verified_email: true,
          name: 'Test User',
          picture: 'https://example.com/avatar.png',
        })
      )
    vi.stubGlobal('fetch', fetchMock)

    const userInfo = await new GoogleUserInfoProvider(CLIENT_ID).getUserInfo(
      'valid-access-token'
    )

    expect(userInfo).toEqual({
      email: 'user@example.com',
      verified_email: true,
      name: 'Test User',
      picture: 'https://example.com/avatar.png',
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/tokeninfo?')
    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal)
  })

  it('rejects a mismatched audience without calling userinfo', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ aud: 'another-client-id' }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      new GoogleUserInfoProvider(CLIENT_ID).getUserInfo('substituted-token')
    ).rejects.toBeInstanceOf(InvalidGoogleTokenError)

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it.each([
    400, 401,
  ] as const)('maps Google HTTP %i to InvalidGoogleTokenError', async (status) => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({}, status))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      new GoogleUserInfoProvider(CLIENT_ID).getUserInfo('invalid-token')
    ).rejects.toBeInstanceOf(InvalidGoogleTokenError)
  })

  it.each([429, 500] as const)('maps Google HTTP %i to 503', async (status) => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({}, status))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      new GoogleUserInfoProvider(CLIENT_ID).getUserInfo('access-token')
    ).rejects.toMatchObject({
      statusCode: 503,
    })
  })

  it('maps malformed token info to 502', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ unexpected: true }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      new GoogleUserInfoProvider(CLIENT_ID).getUserInfo('access-token')
    ).rejects.toMatchObject({
      statusCode: 502,
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('maps malformed user info to 502', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ aud: CLIENT_ID }))
      .mockResolvedValueOnce(jsonResponse({ email: 42 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      new GoogleUserInfoProvider(CLIENT_ID).getUserInfo('access-token')
    ).rejects.toMatchObject({
      statusCode: 502,
    })
  })

  it('maps a timeout or network failure to 503', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new DOMException('Request timed out.', 'TimeoutError'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      new GoogleUserInfoProvider(CLIENT_ID).getUserInfo('access-token')
    ).rejects.toMatchObject({
      statusCode: 503,
    })
  })
})
