import { type Badge, BadgeType } from 'generated/prisma'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { BadgesRepository } from '@/modules/gamification/repositories/badges.repository'
import type { ExerciseSessionsRepository } from '@/modules/session/repositories/exercise-sessions.repository'

import { UnlockExerciseBadgesUseCase } from './unlock-exercise-badges.use-case'

const exerciseBadge: Badge = {
  id: 'badge-id',
  name: 'First exercise',
  description: 'Complete an exercise.',
  type: BadgeType.EXERCISE,
  milestone: 1,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
}

describe('UnlockExerciseBadgesUseCase', () => {
  let badgesRepository: Pick<
    BadgesRepository,
    'findByUser' | 'findAllByType' | 'unlockForUser'
  >
  let exerciseSessionsRepository: Pick<
    ExerciseSessionsRepository,
    'countCompletedByUser'
  >
  let sut: UnlockExerciseBadgesUseCase

  beforeEach(() => {
    badgesRepository = {
      findByUser: vi.fn(async () => []),
      findAllByType: vi.fn(async () => [exerciseBadge]),
      unlockForUser: vi.fn(() => Promise.resolve()),
    }
    exerciseSessionsRepository = {
      countCompletedByUser: vi.fn(async () => 1),
    }
    sut = new UnlockExerciseBadgesUseCase(
      badgesRepository,
      exerciseSessionsRepository
    )
  })

  it('unlocks exercise badges based on completed exercise sessions', async () => {
    await expect(sut.execute({ userId: 'user-id' })).resolves.toEqual({
      badges: [exerciseBadge],
    })

    expect(
      exerciseSessionsRepository.countCompletedByUser
    ).toHaveBeenCalledWith('user-id')
    expect(badgesRepository.unlockForUser).toHaveBeenCalledWith(
      'user-id',
      exerciseBadge.id
    )
  })
})
