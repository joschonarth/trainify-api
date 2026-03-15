import type { BadgeType } from 'generated/prisma'
import { prisma } from '@/lib/prisma'
import type { BadgesRepository } from '../badges.repository'

export class PrismaBadgesRepository implements BadgesRepository {
  async findAll() {
    return await prisma.badge.findMany()
  }

  async findById(badgeId: string) {
    return await prisma.badge.findUnique({
      where: { id: badgeId },
    })
  }

  async findByUser(userId: string) {
    return await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    })
  }

  async findByName(name: string) {
    return await prisma.badge.findUnique({ where: { name } })
  }

  async findAllByType(type: BadgeType) {
    return await prisma.badge.findMany({
      where: { type },
    })
  }

  async unlockForUser(userId: string, badgeId: string) {
    await prisma.userBadge.create({
      data: {
        userId,
        badgeId,
      },
    })
  }
}
