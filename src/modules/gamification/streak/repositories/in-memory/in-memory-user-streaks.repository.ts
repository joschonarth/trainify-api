import { randomUUID } from 'node:crypto'
import type { Prisma, UserStreak } from 'generated/prisma'
import type { UserStreaksRepository } from '../user-streaks.repository'

function unwrap<T>(value: T | { set?: T } | undefined, fallback: T): T {
  if (value === undefined) {
    return fallback
  }
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    return (value as { set?: T }).set ?? fallback
  }
  return value as T
}

export class InMemoryUserStreaksRepository implements UserStreaksRepository {
  items: UserStreak[] = []
  findByUserId(userId: string) {
    const item = this.items.find((item) => item.userId === userId)
    return Promise.resolve(item ? { ...item } : null)
  }
  create(data: Prisma.UserStreakCreateInput) {
    const item: UserStreak = {
      id: data.id ?? randomUUID(),
      userId: data.user.connect?.id ?? '',
      currentStreak: data.currentStreak ?? 0,
      bestStreak: data.bestStreak ?? 0,
      lastBusinessDate: data.lastBusinessDate ?? null,
      lastWorkout: data.lastWorkout ? new Date(data.lastWorkout) : null,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    }
    this.items.push(item)
    return Promise.resolve({ ...item })
  }
  update(id: string, data: Prisma.UserStreakUpdateInput) {
    const item = this.items.find((item) => item.id === id)
    if (!item) {
      return Promise.reject(new Error('Record to update not found.'))
    }
    item.currentStreak = unwrap(data.currentStreak, item.currentStreak)
    item.bestStreak = unwrap(data.bestStreak, item.bestStreak)
    item.lastBusinessDate = unwrap(data.lastBusinessDate, item.lastBusinessDate)
    const date = unwrap<Date | string | null>(
      data.lastWorkout,
      item.lastWorkout
    )
    item.lastWorkout = date ? new Date(date) : null
    item.updatedAt = new Date()
    return Promise.resolve({ ...item })
  }
}
