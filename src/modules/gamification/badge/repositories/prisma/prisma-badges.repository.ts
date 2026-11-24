import type { BadgeType, Prisma } from 'generated/prisma'
import { prisma } from '@/lib/prisma'
import type { BadgesRepository } from '../badges.repository'

export class PrismaBadgesRepository implements BadgesRepository {
  constructor(private readonly client: Prisma.TransactionClient = prisma) {}

  async findAll() {
    return await this.client.badge.findMany()
  }

  async findById(badgeId: string) {
    return await this.client.badge.findUnique({
      where: { id: badgeId },
    })
  }

  async findByUser(userId: string) {
    return await this.client.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    })
  }

  async findByName(name: string) {
    return await this.client.badge.findUnique({ where: { name } })
  }

  async findAllByType(type: BadgeType) {
    return await this.client.badge.findMany({
      where: { type },
    })
  }

  async unlockForUser(userId: string, badgeId: string) {
    const result = await this.client.userBadge.createMany({
      skipDuplicates: true,
      data: {
        userId,
        badgeId,
      },
    })
    return result.count === 1
  }
}
