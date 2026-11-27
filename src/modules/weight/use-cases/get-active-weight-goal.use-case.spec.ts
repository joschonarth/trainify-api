import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { errorHandler } from '@/config/error-handler'
import { InMemoryWeightGoalsRepository } from '../repositories/in-memory/in-memory-weight-goals.repository'
import { getActiveWeightGoalRoute } from '../routes/get-active-weight-goal.route'
import { makeWeightGoal } from '../tests/factories/make-weight-goal'
import { makeGetActiveWeightGoalUseCase } from './factories/make-get-active-weight-goal-use-case'
import { GetActiveWeightGoalUseCase } from './get-active-weight-goal.use-case'

vi.mock('./factories/make-get-active-weight-goal-use-case')

describe('GET /weight/goals/active contract', () => {
  let app: ReturnType<typeof fastify>
  let goals: InMemoryWeightGoalsRepository
  beforeEach(async () => {
    goals = new InMemoryWeightGoalsRepository()
    vi.mocked(makeGetActiveWeightGoalUseCase).mockReturnValue(
      new GetActiveWeightGoalUseCase(goals)
    )
    app = fastify()
    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)
    app.setErrorHandler(errorHandler)
    await app.register(jwt, { secret: 'test-contract-secret' })
    await app.register(swagger, {
      openapi: {
        info: { title: 'test', version: '1' },
        components: {
          securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer' },
            cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' },
          },
        },
      },
      transform: jsonSchemaTransform,
    })
    app.register(getActiveWeightGoalRoute)
    await app.ready()
  })
  afterEach(async () => {
    await app.close()
  })
  function request(authenticated = true) {
    return app.inject({
      method: 'GET',
      url: '/weight/goals/active',
      headers: authenticated
        ? {
            authorization: `Bearer ${app.jwt.sign({ sub: 'user-1', type: 'access' })}`,
          }
        : {},
    })
  }
  it('serializes an owned active goal and documents a non-null success', async () => {
    goals.items.push(makeWeightGoal())
    const response = await request()
    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      activeGoal: { id: 'goal-1', startDate: '2025-01-01T00:00:00.000Z' },
    })
    const operation = JSON.stringify(
      app.swagger().paths?.['/weight/goals/active']?.get?.responses
    )
    expect(operation).toContain('404')
    const schema =
      JSON.parse(operation)['200'].content['application/json'].schema
    expect(schema.required).toContain('activeGoal')
    expect(schema.properties.activeGoal.type).toBe('object')
    expect(schema.properties.activeGoal.nullable).toBeUndefined()
  })
  it.each([
    'missing',
    'inactive',
    'foreign',
  ])('returns 404 for %s goals', async (state) => {
    if (state !== 'missing') {
      goals.items.push(
        makeWeightGoal({
          isActive: state !== 'inactive',
          userId: state === 'foreign' ? 'other' : 'user-1',
        })
      )
    }
    const response = await request()
    expect(response.statusCode).toBe(404)
    expect(response.json()).toEqual({
      message: 'No active weight goal found for this user.',
    })
  })
  it('requires authentication', async () => {
    expect((await request(false)).statusCode).toBe(401)
  })
})
