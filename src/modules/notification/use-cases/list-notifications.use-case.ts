import type {
  NotificationListQuery,
  NotificationsRepository,
} from '../repositories/notifications.repository'

export class ListNotificationsUseCase {
  constructor(private readonly notifications: NotificationsRepository) {}

  async execute(query: NotificationListQuery) {
    const rows = await this.notifications.list(query)
    return {
      notifications: rows.slice(0, query.limit),
      hasMore: rows.length > query.limit,
    }
  }
}
