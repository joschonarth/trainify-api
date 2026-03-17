import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchUserSchedulesController } from '../controllers/fetch-user-schedules.controller'

export function fetchUserSchedulesRoute(app: FastifyInstance) {
  app.get(
    '/me/schedules',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Users'],
        summary: 'Fetch user schedules',
        description:
          'Returns the workout schedules of the authenticated user, including exercises for each day of the week.',
        security: [{ bearerAuth: [] }],
        response: {
          200: z
            .object({
              schedules: z.array(
                z.object({
                  dayOfWeek: z.number(),
                  workout: z.object({
                    id: z.string(),
                    name: z.string(),
                    exercises: z.array(
                      z.object({
                        id: z.string(),
                        name: z.string(),
                        sets: z.number().nullable(),
                        reps: z.number().nullable(),
                        weight: z.number().nullable(),
                      })
                    ),
                  }),
                })
              ),
            })
            .describe('Schedules returned successfully.'),
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid JWT token.'),
          404: z.object({ message: z.string() }).describe('User not found.'),
        },
      },
    },
    fetchUserSchedulesController
  )
}
