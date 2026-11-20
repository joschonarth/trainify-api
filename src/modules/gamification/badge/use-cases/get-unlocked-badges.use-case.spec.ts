import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryBadgesRepository } from '../repositories/in-memory/in-memory-badges.repository'
import { makeBadge } from '../tests/factories/make-badge'
import { GetUnlockedBadgesUseCase } from './get-unlocked-badges.use-case'

let repository: InMemoryBadgesRepository
let sut: GetUnlockedBadgesUseCase

describe('Get unlocked badges', () => {
  beforeEach(() => {
    repository = new InMemoryBadgesRepository()
    sut = new GetUnlockedBadgesUseCase({
      findByUser: repository.findByUser.bind(repository),
    })
  })
  it('should return the included badge metadata and unlock date without requiring individual badge lookups', async () => {
    const badge = makeBadge({ milestone: null, type: 'STREAK' })
    repository.items.push(badge)
    await repository.unlockForUser('user', badge.id)
    expect(await sut.execute({ userId: 'user' })).toEqual({
      badges: [{ ...badge, unlockedAt: repository.userBadges[0]?.unlockedAt }],
    })
  })
  it('should sort badges by most recent unlock without including another user awards or locked badges', async () => {
    const older = makeBadge()
    const newer = makeBadge()
    repository.items.push(older, newer, makeBadge())
    repository.userBadges.push(
      {
        id: 'old',
        userId: 'user',
        badgeId: older.id,
        unlockedAt: new Date('2026-06-01T12:00:00Z'),
      },
      {
        id: 'new',
        userId: 'user',
        badgeId: newer.id,
        unlockedAt: new Date('2026-06-02T12:00:00Z'),
      }
    )
    await repository.unlockForUser('other', older.id)
    const result = await sut.execute({ userId: 'user' })
    expect(result.badges.map((badge) => badge.id)).toEqual([newer.id, older.id])
    expect(result.badges[0]?.unlockedAt).toEqual(
      new Date('2026-06-02T12:00:00Z')
    )
  })
  it('should return an empty list for a user without unlocked badges', async () => {
    const badge = makeBadge()
    repository.items.push(badge)
    await repository.unlockForUser('other', badge.id)
    expect(await sut.execute({ userId: 'user' })).toEqual({ badges: [] })
  })
})
