import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryUserStreaksRepository } from '@/modules/gamification/streak/repositories/in-memory/in-memory-user-streaks.repository'
import { InMemoryBadgesRepository } from '../repositories/in-memory/in-memory-badges.repository'
import { makeBadge } from '../tests/factories/make-badge'
import { UnlockStreakBadgesUseCase } from './unlock-streak-badges.use-case'

let badges: InMemoryBadgesRepository
let streaks: InMemoryUserStreaksRepository
let sut: UnlockStreakBadgesUseCase

describe('UnlockStreakBadgesUseCase', () => {
  beforeEach(async () => {
    badges = new InMemoryBadgesRepository()
    streaks = new InMemoryUserStreaksRepository()
    await streaks.create({
      user: { connect: { id: 'user' } },
      currentStreak: 1,
      bestStreak: 1,
    })
    sut = new UnlockStreakBadgesUseCase(badges, streaks)
  })
  it('should unlock an eligible badge and return it only on the first call', async () => {
    const badge = makeBadge({ type: 'STREAK' })
    badges.items.push(badge)
    expect(await sut.execute({ userId: 'user' })).toEqual({ badges: [badge] })
    expect(await sut.execute({ userId: 'user' })).toEqual({ badges: [] })
    expect(badges.userBadges).toHaveLength(1)
  })
  it('should report a newly unlocked badge in only one concurrent response', async () => {
    const badge = makeBadge({ type: 'STREAK' })
    badges.items.push(badge)
    const results = await Promise.all(
      Array.from({ length: 12 }, () => sut.execute({ userId: 'user' }))
    )
    expect(results.flatMap((result) => result.badges)).toEqual([badge])
    expect(badges.userBadges).toHaveLength(1)
  })
  it('should not award badges for insufficient activity or badges of another type', async () => {
    badges.items.push(
      makeBadge({ type: 'STREAK', milestone: 2 }),
      makeBadge({ type: 'STREAK', milestone: null }),
      makeBadge({ type: 'WORKOUT' })
    )
    expect(await sut.execute({ userId: 'user' })).toEqual({ badges: [] })
    expect(badges.userBadges).toHaveLength(0)
  })
  it('should not count another user activity', async () => {
    badges.items.push(makeBadge({ type: 'STREAK' }))
    expect(await sut.execute({ userId: 'other' })).toEqual({ badges: [] })
    expect(badges.userBadges).toHaveLength(0)
  })
  it('should retry after a persistence failure without reporting an unpersisted badge', async () => {
    const badge = makeBadge({ type: 'STREAK' })
    badges.items.push(badge)
    vi.spyOn(badges, 'unlockForUser').mockRejectedValueOnce(
      new Error('Persistence failed.')
    )
    await expect(sut.execute({ userId: 'user' })).rejects.toThrow(
      'Persistence failed.'
    )
    expect(badges.userBadges).toHaveLength(0)
    expect(await sut.execute({ userId: 'user' })).toEqual({ badges: [badge] })
  })

  it.each([
    0, 1,
  ])('should award a previously reached milestone when the current streak is %s', async (currentStreak) => {
    const streak = streaks.items[0]
    if (!streak) {
      throw new Error('Missing streak fixture')
    }
    await streaks.update(streak.id, { currentStreak, bestStreak: 7 })
    const badge = makeBadge({ type: 'STREAK', milestone: 7 })
    badges.items.push(badge)

    expect(await sut.execute({ userId: 'user' })).toEqual({ badges: [badge] })
    expect(await sut.execute({ userId: 'user' })).toEqual({ badges: [] })
    expect(streaks.items[0]).toMatchObject({ currentStreak, bestStreak: 7 })
  })

  it('should award all reached historical milestones and leave higher milestones locked', async () => {
    const streak = streaks.items[0]
    if (!streak) {
      throw new Error('Missing streak fixture')
    }
    await streaks.update(streak.id, { currentStreak: 0, bestStreak: 14 })
    const reached = [3, 7, 14].map((milestone) =>
      makeBadge({ type: 'STREAK', milestone })
    )
    badges.items.push(...reached, makeBadge({ type: 'STREAK', milestone: 30 }))

    expect(await sut.execute({ userId: 'user' })).toEqual({ badges: reached })
    expect(badges.userBadges).toHaveLength(3)
  })

  it('should keep an existing badge even when the saved best streak is below its milestone', async () => {
    const badge = makeBadge({ type: 'STREAK', milestone: 30 })
    badges.items.push(badge)
    await badges.unlockForUser('user', badge.id)
    const existing = structuredClone(badges.userBadges)

    expect(await sut.execute({ userId: 'user' })).toEqual({ badges: [] })
    expect(badges.userBadges).toEqual(existing)
  })

  it('should report a historical milestone only once across concurrent unlock calls', async () => {
    const streak = streaks.items[0]
    if (!streak) {
      throw new Error('Missing streak fixture')
    }
    await streaks.update(streak.id, { currentStreak: 0, bestStreak: 7 })
    const badge = makeBadge({ type: 'STREAK', milestone: 7 })
    badges.items.push(badge)

    const results = await Promise.all(
      Array.from({ length: 12 }, () => sut.execute({ userId: 'user' }))
    )
    expect(results.flatMap((result) => result.badges)).toEqual([badge])
    expect(badges.userBadges).toHaveLength(1)
  })
})
