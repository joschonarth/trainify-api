import type { FastifyInstance } from 'fastify'
import { WorkoutSessionStatus } from 'generated/prisma'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWorkoutSessionDetailsController } from '../controllers/get-workout-session-details.controller'
import { getWorkoutSessionDetailsParamsSchema } from '../schemas/get-workout-session-details.schema'

const exerciseDetailsSchema = z.object({
  name: z.string().describe('Exercise name.'),
  plannedSets: z.number().nullable().describe('Planned number of sets.'),
  plannedReps: z.number().nullable().describe('Planned number of reps.'),
  plannedWeight: z.number().nullable().describe('Planned weight in kilograms.'),
  completed: z.boolean().describe('Whether the exercise was completed.'),
  loggedSets: z
    .number()
    .nullable()
    .optional()
    .describe('Logged number of sets.'),
  loggedReps: z
    .number()
    .nullable()
    .optional()
    .describe('Logged number of reps.'),
  loggedWeight: z
    .number()
    .nullable()
    .optional()
    .describe('Logged weight in kilograms.'),
  description: z.string().nullable().optional().describe('Log notes.'),
  startedAt: z.date().nullable().optional().describe('Exercise start time.'),
  endedAt: z.date().nullable().optional().describe('Exercise end time.'),
  duration: z
    .number()
    .nullable()
    .optional()
    .describe('Exercise duration in seconds.'),
})

export function getWorkoutSessionDetailsRoute(app: FastifyInstance) {
  app.get(
    '/sessions/:sessionId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Get workout session details',
        description:
          'Returns the details of a specific workout session, including exercise performance data.',
        params: getWorkoutSessionDetailsParamsSchema,
        response: {
          200: z
            .object({
              session: z.object({
                id: z.string().describe('Session ID.'),
                date: z.date().describe('Session date.'),
                status: z
                  .enum(WorkoutSessionStatus)
                  .describe('Session status.'),
                workout: z.string().describe('Workout name.'),
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
                duration: z
                  .number()
                  .nullable()
                  .optional()
                  .describe('Session duration in seconds.'),
                exercises: z.array(exerciseDetailsSchema),
              }),
            })
            .describe('Workout session details fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Workout session not found.'),
        },
      },
    },
    getWorkoutSessionDetailsController
  )
}
