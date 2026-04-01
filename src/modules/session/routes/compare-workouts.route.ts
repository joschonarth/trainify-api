import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { compareWorkoutsController } from '../controllers/compare-workouts.controller'
import { compareWorkoutsQuerySchema } from '../schemas/compare-workouts.schema'

const periodSummarySchema = z.object({
  start: z.string().describe('Start date of the period.'),
  end: z.string().describe('End date of the period.'),
  totalWorkouts: z.number().describe('Total workouts completed in the period.'),
  totalSets: z.number().describe('Total sets performed in the period.'),
  totalReps: z.number().describe('Total reps performed in the period.'),
  totalWeight: z.number().describe('Total weight used in the period.'),
  totalVolume: z.number().describe('Total volume in the period.'),
})

export function compareWorkoutsRoute(app: FastifyInstance) {
  app.get(
    '/sessions/workouts/compare',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Compare workouts',
        description:
          'Compares workout performance between the current and previous period (week or month).',
        querystring: compareWorkoutsQuerySchema,
        response: {
          200: z
            .object({
              result: z.object({
                userId: z.string().describe('User ID.'),
                currentPeriod: periodSummarySchema.describe(
                  'Current period summary.'
                ),
                previousPeriod: periodSummarySchema.describe(
                  'Previous period summary.'
                ),
                differences: z
                  .object({
                    setsDiff: z
                      .number()
                      .describe('Difference in total sets between periods.'),
                    repsDiff: z
                      .number()
                      .describe('Difference in total reps between periods.'),
                    weightDiff: z
                      .number()
                      .describe('Difference in total weight between periods.'),
                    volumeDiff: z
                      .number()
                      .describe('Difference in total volume between periods.'),
                    percentageVolumeChange: z
                      .number()
                      .describe('Percentage change in volume between periods.'),
                  })
                  .describe('Differences between current and previous period.'),
              }),
            })
            .describe('Workouts comparison fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('No sessions found for comparison.'),
        },
      },
    },
    compareWorkoutsController
  )
}
