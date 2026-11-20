import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { compareWorkoutsController } from '../controllers/compare-workouts.controller'
import { compareWorkoutsQuerySchema } from '../schemas/compare-workouts.schema'
import {
  periodDifferencesSchema,
  periodSummarySchema,
} from '../schemas/session-comparison.schema'

export function compareWorkoutsRoute(app: FastifyInstance) {
  app.get(
    '/sessions/workouts/compare',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Sessions'],
        summary: 'Compare workouts',
        description:
          'Compares workout performance between the current and previous period (week or month).',
        querystring: compareWorkoutsQuerySchema,
        response: {
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid authentication token.'),
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
                differences: periodDifferencesSchema.describe(
                  'Differences between periods.'
                ),
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
