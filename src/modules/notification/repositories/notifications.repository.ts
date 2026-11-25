import type { Notification } from 'generated/prisma'

export interface NotificationListQuery {
  recipientId: string
  limit: number
  status: 'all' | 'unread'
  cursor: Pick<Notification, 'createdAt' | 'id'> | undefined
}

export interface NotificationsRepository {
  list(query: NotificationListQuery): Promise<Notification[]>
  markRead(recipientId: string, id: string): Promise<Notification | null>
  markAllRead(recipientId: string): Promise<number>
}
