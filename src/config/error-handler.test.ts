import fastify from 'fastify'
import { describe, expect, it } from 'vitest'
import z from 'zod'
import { NotAllowedError } from '../shared/errors/not-allowed.error'
import { ResourceAlreadyExistsError } from '../shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '../shared/errors/resource-not-found.error'
import { errorHandler } from './error-handler'

async function injectError(error: Error) {
  const app = fastify({ logger: false })
  app.setErrorHandler(errorHandler)
  app.get('/', () => {
    throw error
  })

  try {
    return await app.inject({ method: 'GET', url: '/' })
  } finally {
    await app.close()
  }
}

describe('errorHandler', () => {
  it.each([
    {
      error: () => new NotAllowedError('Access denied.'),
      statusCode: 403,
      message: 'Access denied.',
    },
    {
      error: () => new ResourceNotFoundError('Workout not found.'),
      statusCode: 404,
      message: 'Workout not found.',
    },
    {
      error: () => new ResourceAlreadyExistsError('Workout already exists.'),
      statusCode: 409,
      message: 'Workout already exists.',
    },
  ])('maps domain errors to HTTP $statusCode', async ({
    error,
    statusCode,
    message,
  }) => {
    const response = await injectError(error())

    expect(response.statusCode).toBe(statusCode)
    expect(response.json()).toEqual({ message })
  })

  it('keeps Zod validation details', async () => {
    const result = z.string().safeParse(42)
    if (result.success) {
      throw new Error('Expected the value to fail validation.')
    }

    const response = await injectError(result.error)

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual({
      message: 'Validation error.',
      issues: z.treeifyError(result.error),
    })
  })

  it('keeps the rate limit response', async () => {
    const error = Object.assign(new Error('Rate limit exceeded.'), {
      statusCode: 429,
    })

    const response = await injectError(error)

    expect(response.statusCode).toBe(429)
    expect(response.json()).toEqual({
      message: 'Too many requests. Please try again later.',
    })
  })

  it('keeps the generic internal error response', async () => {
    const response = await injectError(new Error('Unexpected failure.'))

    expect(response.statusCode).toBe(500)
    expect(response.json()).toMatchObject({
      message: 'Internal server error.',
    })
    expect(response.json().requestId).toBeTruthy()
  })
})
