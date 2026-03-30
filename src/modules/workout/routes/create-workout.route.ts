import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { createWorkoutController } from '../controllers/create-workout.controller'
import { createWorkoutBodySchema } from '../schemas/create-workout.schema'

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
              workout: z.object({
                id: z.string().describe('Workout ID.'),
                name: z.string().describe('Workout name.'),
                description: z
                  .string()
                  .nullable()
                  .describe('Workout description.'),
                createdAt: z.date().describe('Workout creation date.'),
                userId: z
                  .string()
                  .describe('ID of the user who owns the workout.'),
              }),
            })
            .describe('Workout created successfully.'),
        },
      },
    },
    createWorkoutController
  )
}
