import { Badge, BadgeType, UserBadge } from '@prisma/client'

export interface BadgesRepository {
  findAll(): Promise<Badge[]>
  findByUser(userId: string): Promise<(UserBadge & { badge: Badge })[]>
  findByName(name: string): Promise<Badge | null>
  findAllByType(type: BadgeType): Promise<Badge[]>
  unlockForUser(userId: string, badgeId: string): Promise<void>
}
