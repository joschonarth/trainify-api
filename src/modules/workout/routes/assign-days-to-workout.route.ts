import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { assignDaysToWorkoutController } from '../controllers/assign-days-to-workout.controller'
import {
  assignDaysToWorkoutBodySchema,
  assignDaysToWorkoutParamsSchema,
} from '../schemas/assign-days-to-workout.schema'

export function assignDaysToWorkoutRoute(app: FastifyInstance) {
  app.post(
    '/workouts/:workoutId/schedules',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Assign days to workout',
        description:
          'Assigns days of the week to a specific workout schedule. Replaces any previously assigned days.',
        params: assignDaysToWorkoutParamsSchema,
        body: assignDaysToWorkoutBodySchema,
        response: {
          200: z
            .object({
              assignedDays: z
                .array(z.number().min(0).max(6))
                .describe(
                  'List of assigned days of the week (0 = Sunday, 6 = Saturday).'
                ),
            })
            .describe('Days assigned to workout successfully.'),
        },
      },
    },
    assignDaysToWorkoutController
  )
}
