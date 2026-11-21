import type { FastifyInstance, FastifyRequest } from 'fastify'
import { ExerciseCategory, ExerciseType, Measurement } from 'generated/prisma'
import { z } from 'zod'

import { requirePermission } from '@/shared/middlewares/require-permission'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'

import { PrismaExercisesRepository } from '../repositories/prisma/prisma-exercises.repository'
import { AdminGlobalExercisesUseCase } from '../use-cases/admin-global-exercises.use-case'

const makeUseCase = () =>
  new AdminGlobalExercisesUseCase(new PrismaExercisesRepository())
const params = z.object({ exerciseId: z.string().min(1) })
const adminExercise = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(ExerciseCategory).nullable(),
  type: z.enum(ExerciseType).nullable(),
  measurement: z.enum(Measurement),
  isCustom: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  archivedAt: z.date().nullable(),
  userId: z.string().nullable(),
})
const body = z
  .object({
    name: z.string().trim().min(1).max(120),
    category: z.enum(ExerciseCategory).nullable().default(null),
    type: z.enum(ExerciseType).nullable().default(null),
    measurement: z.enum(Measurement).default('REPS'),
  })
  .strict()
const patch = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    category: z.enum(ExerciseCategory).nullable().optional(),
    type: z.enum(ExerciseType).nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0)
const security = [{ bearerAuth: [] }, { cookieAuth: [] }]
const commonErrors = {
  400: z.object({ message: z.string() }),
  401: z.object({ message: z.string() }),
  403: z.object({ message: z.string() }),
}

export function adminGlobalExercisesRoute(app: FastifyInstance) {
  const createdTargets = new WeakMap<FastifyRequest, string>()
  app.addHook('onResponse', (request, reply, done) => {
    if (request.method !== 'POST' && request.method !== 'PATCH') {
      return done()
    }
    const route = request.routeOptions.url
    let action = request.method === 'PATCH' ? 'update' : 'create'
    if (route?.endsWith('/archive')) {
      action = 'archive'
    } else if (route?.endsWith('/restore')) {
      action = 'restore'
    }
    request.log.info(
      {
        event: 'admin.global-exercises.mutation',
        actorId: request.user?.sub ?? null,
        targetId:
          createdTargets.get(request) ??
          (request.params as { exerciseId?: string })?.exerciseId ??
          null,
        action,
        result: reply.statusCode < 400 ? 'success' : 'failure',
        statusCode: reply.statusCode,
        requestId: request.id,
      },
      'Administrative global exercise mutation'
    )
    done()
  })
  app.get(
    '/admin/exercises',
    {
      onRequest: [verifyJwt, requirePermission('global-exercises:read')],
      schema: {
        security,
        tags: ['Admin Exercises'],
        querystring: z.object({
          query: z.string().default(''),
          category: z.enum(ExerciseCategory).optional(),
          status: z.enum(['active', 'archived', 'all']).default('active'),
          page: z.coerce.number().int().min(1).default(1),
        }),
        response: {
          ...commonErrors,
          200: z.object({ exercises: z.array(adminExercise) }),
        },
      },
    },
    async (request) => {
      const query = request.query as {
        query: string
        category?: ExerciseCategory
        status: 'active' | 'archived' | 'all'
        page: number
      }
      return await makeUseCase().list({
        ...query,
        category: query.category ?? null,
      })
    }
  )

  app.get(
    '/admin/exercises/:exerciseId',
    {
      onRequest: [verifyJwt, requirePermission('global-exercises:read')],
      schema: {
        security,
        tags: ['Admin Exercises'],
        params,
        response: {
          ...commonErrors,
          200: z.object({ exercise: adminExercise }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request) =>
      await makeUseCase().get(
        (request.params as { exerciseId: string }).exerciseId
      )
  )

  app.post(
    '/admin/exercises',
    {
      onRequest: [verifyJwt, requirePermission('global-exercises:write')],
      schema: {
        security,
        tags: ['Admin Exercises'],
        body,
        response: {
          ...commonErrors,
          201: z.object({ exercise: adminExercise }),
          400: z.object({ message: z.string() }),
          409: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const result = await makeUseCase().create(
        request.body as z.infer<typeof body>
      )
      createdTargets.set(request, result.exercise.id)
      return reply.code(201).send(result)
    }
  )

  app.patch(
    '/admin/exercises/:exerciseId',
    {
      onRequest: [verifyJwt, requirePermission('global-exercises:write')],
      schema: {
        security,
        tags: ['Admin Exercises'],
        params,
        body: patch,
        response: {
          ...commonErrors,
          200: z.object({ exercise: adminExercise }),
          400: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          409: z.object({ message: z.string() }),
        },
      },
    },
    async (request) =>
      await makeUseCase().update({
        exerciseId: (request.params as { exerciseId: string }).exerciseId,
        ...Object.fromEntries(
          Object.entries(request.body as z.infer<typeof patch>).filter(
            ([, value]) => value !== undefined
          )
        ),
      })
  )

  for (const action of ['archive', 'restore'] as const) {
    app.post(
      `/admin/exercises/:exerciseId/${action}`,
      {
        onRequest: [verifyJwt, requirePermission('global-exercises:write')],
        schema: {
          security,
          tags: ['Admin Exercises'],
          params,
          response: {
            ...commonErrors,
            204: z.null(),
            404: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        await makeUseCase().setArchived(
          (request.params as { exerciseId: string }).exerciseId,
          action === 'archive'
        )
        return reply.code(204).send()
      }
    )
  }
}
