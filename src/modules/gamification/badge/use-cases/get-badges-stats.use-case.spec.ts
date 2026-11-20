import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryBadgesRepository } from '../repositories/in-memory/in-memory-badges.repository'
import { makeBadge } from '../tests/factories/make-badge'
import { GetBadgesStatsUseCase } from './get-badges-stats.use-case'

let repository: InMemoryBadgesRepository
let sut: GetBadgesStatsUseCase

describe('Get badges stats', () => {
  beforeEach(() => {
    repository = new InMemoryBadgesRepository()
    sut = new GetBadgesStatsUseCase(repository)
  })
  it('should return zero counts and progress for an empty catalog including every badge type', async () => {
    expect(await sut.execute({ userId: 'user' })).toEqual({
      overall: { total: 0, unlocked: 0, progress: 0 },
      byType: {
        WORKOUT: { total: 0, unlocked: 0, progress: 0 },
        EXERCISE: { total: 0, unlocked: 0, progress: 0 },
        STREAK: { total: 0, unlocked: 0, progress: 0 },
      },
    })
  })
  it('should preserve totals and rounded progress without counting another user awards', async () => {
    const workouts = Array.from({ length: 3 }, () =>
      makeBadge({ type: 'WORKOUT' })
    )
    const exercise = makeBadge({ type: 'EXERCISE' })
    repository.items.push(...workouts, exercise)
    const first = workouts[0]
    const second = workouts[1]
    if (!(first && second)) {
      throw new Error('Missing fixture')
    }
    await repository.unlockForUser('user', first.id)
    await repository.unlockForUser('user', exercise.id)
    await repository.unlockForUser('other', second.id)
    expect(await sut.execute({ userId: 'user' })).toEqual({
      overall: { total: 4, unlocked: 2, progress: 50 },
      byType: {
        WORKOUT: { total: 3, unlocked: 1, progress: 33 },
        EXERCISE: { total: 1, unlocked: 1, progress: 100 },
        STREAK: { total: 0, unlocked: 0, progress: 0 },
      },
    })
  })
  it('should return zero progress for a user without unlocked badges', async () => {
    const badge = makeBadge({ type: 'STREAK' })
    repository.items.push(badge)
    await repository.unlockForUser('other', badge.id)
    expect(await sut.execute({ userId: 'user' })).toMatchObject({
      overall: { total: 1, unlocked: 0, progress: 0 },
      byType: { STREAK: { total: 1, unlocked: 0, progress: 0 } },
    })
  })
  it('should return full progress when every badge is unlocked', async () => {
    for (const type of ['WORKOUT', 'EXERCISE', 'STREAK'] as const) {
      const badge = makeBadge({ type })
      repository.items.push(badge)
      await repository.unlockForUser('user', badge.id)
    }
    expect(await sut.execute({ userId: 'user' })).toEqual({
      overall: { total: 3, unlocked: 3, progress: 100 },
      byType: {
        WORKOUT: { total: 1, unlocked: 1, progress: 100 },
        EXERCISE: { total: 1, unlocked: 1, progress: 100 },
        STREAK: { total: 1, unlocked: 1, progress: 100 },
      },
    })
  })
})
