import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryBadgesRepository } from '../repositories/in-memory/in-memory-badges.repository'
import { makeBadge } from '../tests/factories/make-badge'
import { GetAllBadgesUseCase } from './get-all-badges.use-case'

let repository: InMemoryBadgesRepository
let sut: GetAllBadgesUseCase

describe('Get all badges', () => {
  it('should keep catalog order within unlocked and locked groups', async () => {
    const firstUnlocked = makeBadge()
    const firstLocked = makeBadge()
    const secondLocked = makeBadge()
    const secondUnlocked = makeBadge()
    repository.items.push(
      firstUnlocked,
      firstLocked,
      secondLocked,
      secondUnlocked
    )
    await repository.unlockForUser('user', firstUnlocked.id)
    await repository.unlockForUser('user', secondUnlocked.id)

    expect(
      (await sut.execute({ userId: 'user' })).badges.map((badge) => badge.id)
    ).toEqual([
      firstUnlocked.id,
      secondUnlocked.id,
      firstLocked.id,
      secondLocked.id,
    ])
  })

  beforeEach(() => {
    repository = new InMemoryBadgesRepository()
    sut = new GetAllBadgesUseCase(repository)
  })
  it('should return all badges with unlock metadata and unlocked badges first when the filter is omitted', async () => {
    const locked = makeBadge({ id: 'locked', type: 'WORKOUT' })
    const unlocked = makeBadge({ id: 'unlocked', type: 'EXERCISE' })
    repository.items.push(locked, unlocked)
    await repository.unlockForUser('user', unlocked.id)
    await repository.unlockForUser('other', locked.id)
    expect(await sut.execute({ userId: 'user' })).toEqual({
      badges: [
        {
          ...unlocked,
          unlocked: true,
          unlockedAt: repository.userBadges[0]?.unlockedAt,
        },
        { ...locked, unlocked: false, unlockedAt: undefined },
      ],
    })
  })
  it.each([
    true,
    false,
  ])('should filter by the exact unlock state %s', async (unlocked) => {
    const lockedBadge = makeBadge({ id: 'locked' })
    const unlockedBadge = makeBadge({ id: 'unlocked' })
    repository.items.push(lockedBadge, unlockedBadge)
    await repository.unlockForUser('user', unlockedBadge.id)
    const result = await sut.execute({ userId: 'user', unlocked })
    expect(result.badges).toHaveLength(1)
    expect(result.badges[0]).toMatchObject({
      id: unlocked ? unlockedBadge.id : lockedBadge.id,
      unlocked,
    })
  })
  it('should treat a null filter as omitted for existing callers', async () => {
    repository.items.push(makeBadge())
    const expected = await sut.execute({ userId: 'user' })
    expect(
      await sut.execute({ userId: 'user', unlocked: null, type: null })
    ).toEqual(expected)
    expect(expected.badges).toHaveLength(1)
  })
  it('should combine type and unlock filters', async () => {
    const workout = makeBadge({ type: 'WORKOUT' })
    const exercise = makeBadge({ type: 'EXERCISE' })
    const lockedExercise = makeBadge({ type: 'EXERCISE' })
    repository.items.push(workout, exercise, lockedExercise)
    await repository.unlockForUser('user', workout.id)
    await repository.unlockForUser('user', exercise.id)
    expect(
      (await sut.execute({ userId: 'user', type: 'EXERCISE', unlocked: false }))
        .badges
    ).toEqual([{ ...lockedExercise, unlocked: false, unlockedAt: undefined }])
  })
  it('should include every badge as locked for a user without awards', async () => {
    const badge = makeBadge()
    repository.items.push(badge)
    await repository.unlockForUser('other', badge.id)
    expect((await sut.execute({ userId: 'user' })).badges).toEqual([
      { ...badge, unlocked: false, unlockedAt: undefined },
    ])
  })
  it('should return an empty list for an empty catalog or unmatched type', async () => {
    expect(await sut.execute({ userId: 'user' })).toEqual({ badges: [] })
    repository.items.push(makeBadge({ type: 'STREAK' }))
    expect(await sut.execute({ userId: 'user', type: 'EXERCISE' })).toEqual({
      badges: [],
    })
  })
})
