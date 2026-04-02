import type { FastifyInstance } from 'fastify'
import { WorkoutSessionStatus } from 'generated/prisma'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWorkoutSessionsHistoryController } from '../controllers/get-workout-sessions-history.controller'

const exerciseHistorySchema = z.object({
  name: z.string().describe('Exercise name.'),
  plannedSets: z.number().nullable().describe('Planned number of sets.'),
  plannedReps: z.number().nullable().describe('Planned number of reps.'),
  plannedWeight: z.number().nullable().describe('Planned weight in kilograms.'),
  completed: z.boolean().describe('Whether the exercise was completed.'),
  actualSets: z
    .number()
    .nullable()
    .optional()
    .describe('Actual number of sets performed.'),
  actualReps: z
    .number()
    .nullable()
    .optional()
    .describe('Actual number of reps performed.'),
  actualWeight: z
    .number()
    .nullable()
    .optional()
    .describe('Actual weight used in kilograms.'),
  description: z.string().nullable().optional().describe('Log notes.'),
  duration: z
    .number()
    .nullable()
    .optional()
    .describe('Exercise duration in seconds.'),
  startedAt: z.date().nullable().optional().describe('Exercise start time.'),
  endedAt: z.date().nullable().optional().describe('Exercise end time.'),
})

export function getWorkoutSessionsHistoryRoute(app: FastifyInstance) {
  app.get(
    '/sessions/history',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Get workout sessions history',
        description:
          'Returns the full workout session history for the authenticated user.',
        response: {
          200: z
            .object({
              sessions: z.array(
                z.object({
                  id: z.string().describe('Session ID.'),
                  date: z.date().describe('Session date.'),
                  status: z
                    .enum(WorkoutSessionStatus)
                    .describe('Session status.'),
                  workout: z.string().describe('Workout name.'),
                  duration: z
                    .number()
                    .nullable()
                    .optional()
                    .describe('Session duration in seconds.'),
                  startedAt: z
                    .date()
                    .nullable()
                    .optional()
                    .describe('Session start time.'),
                  endedAt: z
                    .date()
                    .nullable()
                    .optional()
                    .describe('Session end time.'),
                  exercises: z.array(exerciseHistorySchema),
                })
              ),
            })
            .describe('Workout sessions history fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('No sessions found for this user.'),
        },
      },
    },
    getWorkoutSessionsHistoryController
  )
}
