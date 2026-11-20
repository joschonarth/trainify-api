import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryWorkoutSessionsRepository } from '@/modules/session/repositories/in-memory/in-memory-workout-sessions.repository'
import { makeTimerWorkoutSession } from '@/modules/session/tests/factories/make-timer-session'
import { InMemoryBadgesRepository } from '../repositories/in-memory/in-memory-badges.repository'
import { makeBadge } from '../tests/factories/make-badge'
import { UnlockWorkoutBadgesUseCase } from './unlock-workout-badges.use-case'

let badges: InMemoryBadgesRepository
let workouts: InMemoryWorkoutSessionsRepository
let sut: UnlockWorkoutBadgesUseCase

describe('UnlockWorkoutBadgesUseCase', () => {
  beforeEach(() => {
    badges = new InMemoryBadgesRepository()
    workouts = new InMemoryWorkoutSessionsRepository()
    workouts.items.push(makeTimerWorkoutSession({ status: 'COMPLETED' }))
    sut = new UnlockWorkoutBadgesUseCase(badges, workouts)
  })
  it('should unlock an eligible badge and return it only on the first call', async () => {
    const badge = makeBadge({ type: 'WORKOUT' })
    badges.items.push(badge)
    expect(await sut.execute({ userId: 'user' })).toEqual({ badges: [badge] })
    expect(await sut.execute({ userId: 'user' })).toEqual({ badges: [] })
    expect(badges.userBadges).toHaveLength(1)
  })
  it('should report a newly unlocked badge in only one concurrent response', async () => {
    const badge = makeBadge({ type: 'WORKOUT' })
    badges.items.push(badge)
    const results = await Promise.all(
      Array.from({ length: 12 }, () => sut.execute({ userId: 'user' }))
    )
    expect(results.flatMap((result) => result.badges)).toEqual([badge])
    expect(badges.userBadges).toHaveLength(1)
  })
  it('should not award badges for insufficient activity or badges of another type', async () => {
    badges.items.push(
      makeBadge({ type: 'WORKOUT', milestone: 2 }),
      makeBadge({ type: 'WORKOUT', milestone: null }),
      makeBadge({ type: 'EXERCISE' })
    )
    expect(await sut.execute({ userId: 'user' })).toEqual({ badges: [] })
    expect(badges.userBadges).toHaveLength(0)
  })
  it('should not count another user activity', async () => {
    badges.items.push(makeBadge({ type: 'WORKOUT' }))
    expect(await sut.execute({ userId: 'other' })).toEqual({ badges: [] })
    expect(badges.userBadges).toHaveLength(0)
  })
  it('should retry after a persistence failure without reporting an unpersisted badge', async () => {
    const badge = makeBadge({ type: 'WORKOUT' })
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
})
