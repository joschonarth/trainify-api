import type { NotificationsRepository } from '../repositories/notifications.repository'

export class MarkAllNotificationsReadUseCase {
  constructor(private readonly notifications: NotificationsRepository) {}

  async execute({ recipientId }: { recipientId: string }) {
    const updatedCount = await this.notifications.markAllRead(recipientId)
    return { updatedCount }
  }
}
