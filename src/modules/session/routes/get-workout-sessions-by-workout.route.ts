import type { FastifyInstance } from 'fastify'
import { WorkoutSessionStatus } from 'generated/prisma'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWorkoutSessionsByWorkoutController } from '../controllers/get-workout-sessions-by-workout.controller'
import { getWorkoutSessionsByWorkoutParamsSchema } from '../schemas/get-workout-sessions-by-workout.schema'

export function getWorkoutSessionsByWorkoutRoute(app: FastifyInstance) {
  app.get(
    '/workouts/:workoutId/sessions',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Sessions'],
        summary: 'Get workout sessions by workout',
        description:
          'All logs contribute to sets, reps and volume. Reps sums per-log values, not sets times reps; weight is the latest log weight by date and ID. DURATION has zero load volume. Returns sessions for an owned workout, including archived workouts. A workout without history returns an empty list and totalSessions 0. The weight field is the latest log weight, rather than a sum of weights; ties use log ID descending. Missing or unweighted logs return 0.',
        params: getWorkoutSessionsByWorkoutParamsSchema,
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
          404: z
            .object({ message: z.string() })
            .describe(
              'Workout not found or not owned by the authenticated user.'
            ),
          200: z
            .object({
              workoutId: z.string().describe('Workout ID.'),
              workoutName: z.string().describe('Workout name.'),
              totalSessions: z.number().describe('Total number of sessions.'),
              sessions: z.array(
                z.object({
                  id: z.string().describe('Session ID.'),
                  date: z.string().describe('Session date.'),
                  status: z
                    .enum(WorkoutSessionStatus)
                    .describe('Session status.'),
                  totalVolume: z
                    .number()
                    .describe('Total volume for the session.'),
                  exerciseSessions: z.array(
                    z.object({
                      exerciseName: z.string().describe('Exercise name.'),
                      sets: z.number().describe('Number of sets performed.'),
                      reps: z
                        .number()
                        .describe(
                          'Repetitions for REPS or seconds per set for DURATION, summed across logs.'
                        ),
                      weight: z
                        .number()
                        .describe(
                          'Weight in kilograms from the latest log by date then ID descending; 0 for missing or unweighted logs.'
                        ),
                      volume: z
                        .number()
                        .describe(
                          'Sum of logged load volumes for REPS; zero for DURATION.'
                        ),
                      completed: z.boolean(),
                      skipReason: z.string().nullable(),
                      state: z.enum(['COMPLETED', 'SKIPPED', 'PENDING']),
                    })
                  ),
                })
              ),
            })
            .describe('Workout sessions fetched successfully.'),
        },
      },
    },
    getWorkoutSessionsByWorkoutController
  )
}
