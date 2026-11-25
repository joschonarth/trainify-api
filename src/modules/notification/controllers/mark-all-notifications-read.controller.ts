import type { FastifyRequest } from 'fastify'
import { makeMarkAllNotificationsReadUseCase } from '../use-cases/factories/make-mark-all-notifications-read-use-case'

export function markAllNotificationsReadController(
  request: Pick<FastifyRequest, 'user'>
) {
  return makeMarkAllNotificationsReadUseCase().execute({
    recipientId: request.user.sub,
  })
}
