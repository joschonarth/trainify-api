import { z } from 'zod'

export const listWeightLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type ListWeightLogsQuery = z.infer<typeof listWeightLogsQuerySchema>
