import type { WeightGoal } from 'generated/prisma'

export function makeWeightGoal(
  overrides: Partial<WeightGoal> = {}
): WeightGoal {
  const now = new Date('2025-01-01T00:00:00.000Z')
  return {
    id: 'goal-1',
    userId: 'user-1',
    name: 'Goal',
    description: null,
    goalType: 'LOSE',
    startWeight: 80,
    targetWeight: 70,
    startDate: now,
    endDate: null,
    achievedAt: null,
    isActive: true,
    progress: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}
