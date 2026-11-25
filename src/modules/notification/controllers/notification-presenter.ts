import type { Notification } from 'generated/prisma'
import { badgeNotificationDataSchema } from '../schemas/notification.schema'

export function toNotificationDto({
  id,
  type,
  data,
  createdAt,
  readAt,
}: Notification) {
  const snapshot = badgeNotificationDataSchema.safeParse(data)
  if (!snapshot.success) {
    throw new Error('Invalid persisted notification data')
  }
  return {
    id,
    type,
    data: snapshot.data,
    createdAt: createdAt.toISOString(),
    readAt: readAt?.toISOString() ?? null,
  }
}
