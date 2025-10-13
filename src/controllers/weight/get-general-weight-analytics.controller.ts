import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetGeneralWeightAnalyticsUseCase } from '@/use-cases/weight/factories/make-get-general-weight-analytics-use-case'

export async function getGeneralWeightAnalyticsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const querySchema = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  })

  const { from: fromStr, to: toStr } = querySchema.parse(request.query)

  const from = fromStr ? new Date(fromStr) : undefined
  const to = toStr ? new Date(toStr) : undefined

  const userId = request.user.sub

  const getGeneralWeightAnalyticsUseCase =
    makeGetGeneralWeightAnalyticsUseCase()

  const payload: Partial<{
    userId: string
    from: Date
    to: Date
  }> & { userId: string } = { userId }

  if (from) payload.from = from
  if (to) payload.to = to

  const analytics = await getGeneralWeightAnalyticsUseCase.execute(payload)

  return reply.status(200).send(analytics)
}
