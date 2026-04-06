import { z } from 'zod'

export const getWeightLogParamsSchema = z.object({
  logId: z.string(),
})

export type GetWeightLogParams = z.infer<typeof getWeightLogParamsSchema>
