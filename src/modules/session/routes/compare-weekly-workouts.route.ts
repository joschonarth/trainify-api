import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { compareWeeklyWorkoutsController } from '../controllers/compare-weekly-workouts.controller'
import {
  periodDifferencesSchema,
  periodSummarySchema,
} from '../schemas/session.schema'

export function compareWeeklyWorkoutsRoute(app: FastifyInstance) {
  app.get(
    '/sessions/workouts/compare/weekly',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Compare weekly workouts',
        description:
          'Compares workout performance between the current week and the previous week.',
        response: {
          200: z
            .object({
              result: z.object({
                userId: z.string().describe('User ID.'),
                currentWeek: periodSummarySchema.describe(
                  'Current week summary.'
                ),
                previousWeek: periodSummarySchema.describe(
                  'Previous week summary.'
                ),
                differences: periodDifferencesSchema.describe(
                  'Differences between weeks.'
                ),
              }),
            })
            .describe('Weekly workouts comparison fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('No sessions found for comparison.'),
        },
      },
    },
    compareWeeklyWorkoutsController
  )
}
