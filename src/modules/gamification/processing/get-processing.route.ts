import type { FastifyInstance } from 'fastify'
import { BadgeType, SessionEventProcessingStatus } from 'generated/prisma'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'

const processingParams = z.object({ processingId: z.uuid() })
const unlockedBadges = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(BadgeType),
    milestone: z.number().nullable(),
    createdAt: z.iso.datetime(),
  })
)
const processingResponse = z.object({
  processingId: z.uuid(),
  sessionId: z.string(),
  status: z.enum(SessionEventProcessingStatus),
  unlockedBadges: unlockedBadges.nullable(),
  completedAt: z.iso.datetime().nullable(),
})
const errorResponse = z.object({ message: z.string() })

export function getProcessingRoute(app: FastifyInstance) {
  app.get<{ Params: z.infer<typeof processingParams> }>(
    '/gamification/processings/:processingId',
    {
      onRequest: [verifyJwt],
      schema: {
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        tags: ['Gamification'],
        summary: 'Get the gamification result for a workout finalization',
        description:
          'Returns the processing status and, once completed, the badges granted by that processing.',
        params: processingParams,
        response: {
          200: processingResponse,
          400: errorResponse,
          401: errorResponse,
          404: errorResponse,
        },
      },
    },
    async (request, reply) => {
      const { processingId } = request.params
      const row = await prisma.sessionEventProcessing.findUnique({
        where: { eventId: processingId, userId: request.user.sub },
        select: {
          sessionId: true,
          status: true,
          unlockedBadges: true,
          completedAt: true,
        },
      })
      if (!row) {
        throw new ResourceNotFoundError('Gamification processing not found.')
      }
      const completed = row.status === 'COMPLETED'
      return reply.send({
        processingId,
        sessionId: row.sessionId,
        status: row.status,
        unlockedBadges: completed
          ? unlockedBadges.parse(row.unlockedBadges)
          : null,
        completedAt: completed ? row.completedAt?.toISOString() : null,
      })
    }
  )
}
