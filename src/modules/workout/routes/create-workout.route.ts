import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { createWorkoutController } from '../controllers/create-workout.controller'
import { createWorkoutBodySchema } from '../schemas/create-workout.schema'
import { baseWorkoutSchema } from '../schemas/workout.schema'

export function createWorkoutRoute(app: FastifyInstance) {
  app.post(
    '/workouts',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Create workout',
        description: 'Creates a new workout for the authenticated user.',
        body: createWorkoutBodySchema,
        response: {
          201: z
            .object({
              workout: baseWorkoutSchema,
            })
            .describe('Workout created successfully.'),
        },
      },
    },
    createWorkoutController
  )
}
