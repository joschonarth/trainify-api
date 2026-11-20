import { randomUUID } from 'node:crypto'
import type { Badge } from 'generated/prisma'

export function makeBadge(overrides: Partial<Badge> = {}): Badge {
  return {
    id: randomUUID(),
    name: 'First workout',
    description: 'Complete a workout.',
    type: 'WORKOUT',
    milestone: 1,
    createdAt: new Date(),
    ...overrides,
  }
}
