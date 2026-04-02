import { z } from 'zod'

export const deleteWeightLogParamsSchema = z.object({
  logId: z.string(),
})

export type DeleteWeightLogParams = z.infer<typeof deleteWeightLogParamsSchema>
