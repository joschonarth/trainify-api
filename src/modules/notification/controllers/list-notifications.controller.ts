import type { FastifyRequest } from 'fastify'
import type { ListNotificationsQuery } from '../schemas/notification.schema'
import { makeListNotificationsUseCase } from '../use-cases/factories/make-list-notifications-use-case'
import {
  decodeNotificationPageToken,
  encodeNotificationPageToken,
} from '../utils/notification-page-token'
import { toNotificationDto } from './notification-presenter'

export async function listNotificationsController(
  request: Pick<FastifyRequest, 'user'> & { query: ListNotificationsQuery }
) {
  const { limit, status, cursor } = request.query
  const { notifications, hasMore } =
    await makeListNotificationsUseCase().execute({
      recipientId: request.user.sub,
      limit,
      status,
      cursor:
        cursor === undefined ? undefined : decodeNotificationPageToken(cursor),
    })
  const last = notifications.at(-1)
  return {
    items: notifications.map(toNotificationDto),
    nextCursor: hasMore && last ? encodeNotificationPageToken(last) : null,
  }
}
