import { z } from 'zod'

export const getGeneralWeightAnalyticsQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
})

export type GetGeneralWeightAnalyticsQuery = z.infer<
  typeof getGeneralWeightAnalyticsQuerySchema
>
