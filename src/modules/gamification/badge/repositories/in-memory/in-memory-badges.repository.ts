import { randomUUID } from 'node:crypto'
import type { Badge, BadgeType, UserBadge } from 'generated/prisma'
import type { BadgesRepository } from '../badges.repository'

export class InMemoryBadgesRepository implements BadgesRepository {
  items: Badge[] = []
  userBadges: UserBadge[] = []
  findAll() {
    return Promise.resolve([...this.items])
  }
  findById(badgeId: string) {
    return Promise.resolve(
      this.items.find((item) => item.id === badgeId) ?? null
    )
  }
  findByName(name: string) {
    return Promise.resolve(
      this.items.find((item) => item.name === name) ?? null
    )
  }
  findAllByType(type: BadgeType) {
    return Promise.resolve(this.items.filter((item) => item.type === type))
  }
  findByUser(userId: string) {
    return Promise.resolve(
      this.userBadges
        .filter((item) => item.userId === userId)
        .map((item) => {
          const badge = this.items.find((badge) => badge.id === item.badgeId)
          if (!badge) {
            throw new Error('Badge fixture not found.')
          }
          return { ...item, badge }
        })
    )
  }
  unlockForUser(userId: string, badgeId: string) {
    if (
      this.userBadges.some(
        (item) => item.userId === userId && item.badgeId === badgeId
      )
    ) {
      return Promise.resolve(false)
    }
    this.userBadges.push({
      id: randomUUID(),
      userId,
      badgeId,
      unlockedAt: new Date(),
    })
    return Promise.resolve(true)
  }
}
