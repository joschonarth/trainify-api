import type { Prisma, PrismaClient } from 'generated/prisma'
import type {
  NotificationListQuery,
  NotificationsRepository,
} from '../notifications.repository'

export class PrismaNotificationsRepository implements NotificationsRepository {
  constructor(private readonly db: PrismaClient) {}

  list({ recipientId, limit, status, cursor }: NotificationListQuery) {
    const where: Prisma.NotificationWhereInput = { recipientId }
    if (status === 'unread') {
      where.readAt = null
    }
    if (cursor) {
      where.OR = [
        { createdAt: { lt: cursor.createdAt } },
        { createdAt: cursor.createdAt, id: { lt: cursor.id } },
      ]
    }
    return this.db.notification.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    })
  }

  async markRead(recipientId: string, id: string) {
    const where = { id, recipientId }
    const [updated] = await this.db.notification.updateManyAndReturn({
      where: { ...where, readAt: null },
      data: { readAt: new Date() },
    })
    return updated ?? (await this.db.notification.findUnique({ where }))
  }

  async markAllRead(recipientId: string) {
    const { count } = await this.db.notification.updateMany({
      where: { recipientId, readAt: null },
      data: { readAt: new Date() },
    })
    return count
  }
}
