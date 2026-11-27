import jwt from '@fastify/jwt'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { errorHandler } from '@/config/error-handler'
import { adminGlobalExercisesRoute } from './admin-global-exercises.route'

const { findById, create } = vi.hoisted(() => ({
  findById: vi.fn(),
  create: vi.fn(),
}))

vi.mock('@/modules/user/repositories/prisma/prisma-users.repository', () => ({
  PrismaUsersRepository: class {
    findById = findById
  },
}))
vi.mock('../repositories/prisma/prisma-exercises.repository', () => ({
  PrismaExercisesRepository: class {},
}))
vi.mock('../use-cases/admin-global-exercises.use-case', () => ({
  AdminGlobalExercisesUseCase: class {
    create = create
  },
}))

describe('Admin global exercise HTTP authorization and contracts', () => {
  let app: ReturnType<typeof fastify>
  let token: string

  beforeEach(async () => {
    vi.resetAllMocks()
    findById.mockResolvedValue({ id: 'admin', role: 'ADMIN' })
    app = fastify()
    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)
    app.setErrorHandler(errorHandler)
    await app.register(jwt, { secret: 'test-secret' })
    app.register(adminGlobalExercisesRoute)
    await app.ready()
    token = app.jwt.sign({ sub: 'admin', type: 'access', role: 'ADMIN' })
  })

  afterEach(async () => {
    await app.close()
  })

  const endpoints = [
    ['GET', '/admin/exercises'],
    ['GET', '/admin/exercises/id'],
    ['POST', '/admin/exercises'],
    ['PATCH', '/admin/exercises/id'],
    ['POST', '/admin/exercises/id/archive'],
    ['POST', '/admin/exercises/id/restore'],
  ] as const

  it.each(
    endpoints
  )('rejects anonymous and USER requests: %s %s', async (method, url) => {
    expect((await app.inject({ method, url })).statusCode).toBe(401)
    findById.mockResolvedValue({ id: 'admin', role: 'USER' })
    expect(
      (
        await app.inject({
          method,
          url,
          headers: { authorization: `Bearer ${token}` },
        })
      ).statusCode
    ).toBe(403)
  })

  it('rechecks the persisted role and rejects removed users and database failures', async () => {
    const request = {
      method: 'POST' as const,
      url: '/admin/exercises',
      headers: { authorization: `Bearer ${token}` },
      payload: {},
    }
    expect((await app.inject(request)).statusCode).toBe(400)
    findById.mockResolvedValue({ id: 'admin', role: 'USER' })
    expect((await app.inject(request)).statusCode).toBe(403)
    findById.mockResolvedValue(null)
    expect((await app.inject(request)).statusCode).toBe(401)
    findById.mockRejectedValue(new Error('database unavailable'))
    expect((await app.inject(request)).statusCode).toBe(500)
    expect(create).not.toHaveBeenCalled()
  })

  it.each([
    { name: '   ' },
    { name: 'Squat', role: 'ADMIN' },
    { name: 'Squat', userId: 'admin' },
    { name: 'Squat', isCustom: false },
    { name: 'Squat', measurement: 'INVALID' },
  ])('rejects invalid creation payloads: %j', async (payload) => {
    const response = await app.inject({
      method: 'POST',
      url: '/admin/exercises',
      headers: { authorization: `Bearer ${token}` },
      payload,
    })
    expect(response.statusCode).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })
})
