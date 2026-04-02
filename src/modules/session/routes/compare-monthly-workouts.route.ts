import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { compareMonthlyWorkoutsController } from '../controllers/compare-monthly-workouts.controller'
import {
  periodDifferencesSchema,
  periodSummarySchema,
} from '../schemas/session.schema'

export function compareMonthlyWorkoutsRoute(app: FastifyInstance) {
  app.get(
    '/sessions/workouts/compare/monthly',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Compare monthly workouts',
        description:
          'Compares workout performance between the current month and the previous month.',
        response: {
          200: z
            .object({
              result: z.object({
                userId: z.string().describe('User ID.'),
                currentMonth: periodSummarySchema.describe(
                  'Current month summary.'
                ),
                previousMonth: periodSummarySchema.describe(
                  'Previous month summary.'
                ),
                differences: periodDifferencesSchema.describe(
                  'Differences between months.'
                ),
              }),
            })
            .describe('Monthly workouts comparison fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('No sessions found for comparison.'),
        },
      },
    },
    compareMonthlyWorkoutsController
  )
}
