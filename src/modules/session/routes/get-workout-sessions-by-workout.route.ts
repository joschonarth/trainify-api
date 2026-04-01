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
        tags: ['Sessions'],
        summary: 'Get workout sessions by workout',
        description:
          'Returns all sessions for a specific workout, including exercise performance data.',
        params: getWorkoutSessionsByWorkoutParamsSchema,
        response: {
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
                      reps: z.number().describe('Number of reps performed.'),
                      weight: z.number().describe('Weight used in kilograms.'),
                      volume: z
                        .number()
                        .describe('Volume (sets * reps * weight).'),
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
