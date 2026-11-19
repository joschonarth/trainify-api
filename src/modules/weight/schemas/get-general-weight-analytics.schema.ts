import { z } from 'zod'

export const getGeneralWeightAnalyticsQuerySchema = z
  .object({
    from: z.iso
      .datetime()
      .transform((value) => new Date(value))
      .optional(),
    to: z.iso
      .datetime()
      .transform((value) => new Date(value))
      .optional(),
  })
  .refine((query) => !(query.from && query.to) || query.from <= query.to, {
    message: 'The from date must be before or equal to the to date.',
    path: ['to'],
  })

export type GetGeneralWeightAnalyticsQuery = z.infer<
  typeof getGeneralWeightAnalyticsQuerySchema
>
