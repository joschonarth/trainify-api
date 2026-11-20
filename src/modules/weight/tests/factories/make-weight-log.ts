import type { WeightLog } from 'generated/prisma'

export function makeWeightLog(overrides: Partial<WeightLog> = {}): WeightLog {
  const now = new Date('2025-01-01T00:00:00.000Z')
  return {
    id: 'log-1',
    userId: 'user-1',
    goalId: 'goal-1',
    weight: 75,
    note: null,
    date: now,
    createdAt: now,
    ...overrides,
  }
}
