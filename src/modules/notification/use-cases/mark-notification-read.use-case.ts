import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { NotificationsRepository } from '../repositories/notifications.repository'

export class MarkNotificationReadUseCase {
  constructor(private readonly notifications: NotificationsRepository) {}

  async execute({
    recipientId,
    notificationId,
  }: {
    recipientId: string
    notificationId: string
  }) {
    const notification = await this.notifications.markRead(
      recipientId,
      notificationId
    )
    if (!notification) {
      throw new ResourceNotFoundError('Notification not found.')
    }
    if (notification.readAt === null) {
      throw new Error('Notification read time was not persisted')
    }
    return { notification: { ...notification, readAt: notification.readAt } }
  }
}
