import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { compareWorkoutExercisesController } from '../controllers/compare-workout-exercises.controller'
import { compareWorkoutExercisesParamsSchema } from '../schemas/compare-workout-exercises.schema'

const exerciseProgressSchema = z.object({
  exercise: z.string().describe('Exercise name.'),
  sessions: z
    .array(
      z.object({
        date: z.string().describe('Session date.'),
        sets: z.number().describe('Number of sets performed.'),
        reps: z.number().describe('Number of reps performed.'),
        weight: z.number().describe('Weight used in kilograms.'),
        volume: z.number().describe('Volume (sets * reps * weight).'),
      })
    )
    .describe('Performance data per session.'),
  progress: z
    .object({
      setsDiff: z
        .number()
        .describe('Difference in sets between last two sessions.'),
      weightDiff: z
        .number()
        .describe('Difference in weight between last two sessions.'),
      repsDiff: z
        .number()
        .describe('Difference in reps between last two sessions.'),
      volumeDiff: z
        .number()
        .describe('Difference in volume between last two sessions.'),
    })
    .describe('Progress comparison between last two sessions.'),
})

export function compareWorkoutExercisesRoute(app: FastifyInstance) {
  app.get(
    '/sessions/:workoutId/exercises/comparison',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Compare workout exercises',
        description:
          'Returns a per-exercise progress comparison between the last two sessions of a specific workout.',
        params: compareWorkoutExercisesParamsSchema,
        response: {
          200: z
            .object({
              result: z.object({
                workoutId: z.string().describe('Workout ID.'),
                progress: z.array(exerciseProgressSchema),
              }),
            })
            .describe('Workout exercises comparison fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Workout or sessions not found.'),
        },
      },
    },
    compareWorkoutExercisesController
  )
}
