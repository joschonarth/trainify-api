import { z } from 'zod'

export const weightAnalyticsSchema = z.object({
  dataPoints: z
    .array(
      z.object({
        date: z.date().describe('Date of the weight log.'),
        weight: z.number().describe('Logged weight in kilograms.'),
      })
    )
    .describe('Weight data points over time.'),
  avgChangePerWeek: z
    .number()
    .describe('Average weight change per week in kilograms.'),
  trendDirection: z
    .enum(['increasing', 'decreasing', 'stable'])
    .describe('Overall weight trend direction.'),
})
