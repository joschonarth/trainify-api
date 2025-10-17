import { BadgeType, PrismaClient } from '@prisma/client'

import { BadgesRepository } from '../badges.repository'

const prisma = new PrismaClient()

export class PrismaBadgesRepository implements BadgesRepository {
  async findAll() {
    return prisma.badge.findMany()
  }

  async findById(badgeId: string) {
    return prisma.badge.findUnique({
      where: { id: badgeId },
    })
  }

  async findByUser(userId: string) {
    return prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    })
  }

  async findByName(name: string) {
    return prisma.badge.findUnique({ where: { name } })
  }

  async findAllByType(type: BadgeType) {
    return prisma.badge.findMany({
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
