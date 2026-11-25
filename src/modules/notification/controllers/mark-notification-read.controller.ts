import type { FastifyRequest } from 'fastify'
import type { NotificationParams } from '../schemas/notification.schema'
import { makeMarkNotificationReadUseCase } from '../use-cases/factories/make-mark-notification-read-use-case'
import { toNotificationDto } from './notification-presenter'

export async function markNotificationReadController(
  request: Pick<FastifyRequest, 'user'> & { params: NotificationParams }
) {
  const { notification } = await makeMarkNotificationReadUseCase().execute({
    recipientId: request.user.sub,
    notificationId: request.params.notificationId,
  })
  return {
    ...toNotificationDto(notification),
    readAt: notification.readAt.toISOString(),
  }
}
