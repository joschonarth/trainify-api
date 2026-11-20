import type { User } from 'generated/prisma'

export function makeWeightUser(
  id = 'user-1',
  weight: number | null = 80
): User {
  return {
    id,
    name: 'Test User',
    email: `${id}@example.com`,
    password: null,
    tokenVersion: 0,
    avatarUrl: null,
    timezone: 'UTC',
    height: null,
    weight,
    gender: null,
    birthdate: null,
    createdAt: new Date(),
  }
}
