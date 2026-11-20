import { randomUUID } from 'node:crypto'
import type { WeightLog } from 'generated/prisma'

import type {
  CreateWeightLogData,
  WeightLogsRepository,
} from '../weight-logs.repository'

export class InMemoryWeightLogsRepository implements WeightLogsRepository {
  items: WeightLog[] = []

  create(data: CreateWeightLogData): Promise<WeightLog> {
    const now = new Date()
    const log: WeightLog = {
      id: randomUUID(),
      userId: data.userId,
      goalId: data.goalId ?? null,
      weight: data.weight,
      note: data.note ?? null,
      date: data.date ?? now,
      createdAt: now,
    }
    this.items.push(log)
    return Promise.resolve(log)
  }

  findById(id: string): Promise<WeightLog | null> {
    return Promise.resolve(this.items.find((log) => log.id === id) ?? null)
  }

  findPageByUserId({
    userId,
    page,
    pageSize,
  }: {
    userId: string
    page: number
    pageSize: number
  }): Promise<{ weightLogs: WeightLog[]; total: number }> {
    const rows = this.items
      .filter((log) => log.userId === userId)
      .sort(
        (a, b) =>
          b.date.getTime() - a.date.getTime() || b.id.localeCompare(a.id)
      )
    return Promise.resolve({
      weightLogs: rows.slice((page - 1) * pageSize, page * pageSize),
      total: rows.length,
    })
  }

  findManyByUserId(
    userId: string,
    filters?: { from?: Date; to?: Date }
  ): Promise<WeightLog[]> {
    return Promise.resolve(
      this.items
        .filter(
          (log) =>
            log.userId === userId &&
            (!filters?.from || log.date >= filters.from) &&
            (!filters?.to || log.date <= filters.to)
        )
        .sort(
          (a, b) =>
            a.date.getTime() - b.date.getTime() || a.id.localeCompare(b.id)
        )
    )
  }

  findByGoalId(goalId: string): Promise<WeightLog[]> {
    return Promise.resolve(
      this.items
        .filter((log) => log.goalId === goalId)
        .sort(
          (a, b) =>
            a.date.getTime() - b.date.getTime() || a.id.localeCompare(b.id)
        )
    )
  }

  findLatestByUserId(
    userId: string,
    through?: Date
  ): Promise<WeightLog | null> {
    const rows = this.items
      .filter(
        (log) => log.userId === userId && (!through || log.date <= through)
      )
      .sort(
        (a, b) =>
          b.date.getTime() - a.date.getTime() || b.id.localeCompare(a.id)
      )
    return Promise.resolve(rows[0] ?? null)
  }

  async findLatestByGoalId(goalId: string): Promise<WeightLog | null> {
    const logs = await this.findByGoalId(goalId)
    return logs.at(-1) ?? null
  }

  findFirstByUserId(userId: string): Promise<WeightLog | null> {
    const log = this.items
      .filter((item) => item.userId === userId)
      .sort(
        (a, b) =>
          a.date.getTime() - b.date.getTime() || a.id.localeCompare(b.id)
      )[0]
    return Promise.resolve(log ?? null)
  }

  findMinByUserId(userId: string): Promise<WeightLog | null> {
    const log = this.items
      .filter((item) => item.userId === userId)
      .sort((a, b) => a.weight - b.weight)[0]
    return Promise.resolve(log ?? null)
  }

  findMaxByUserId(userId: string): Promise<WeightLog | null> {
    const log = this.items
      .filter((item) => item.userId === userId)
      .sort((a, b) => b.weight - a.weight)[0]
    return Promise.resolve(log ?? null)
  }

  findAverageByUserId(userId: string): Promise<number | null> {
    const rows = this.items.filter((log) => log.userId === userId)
    const average = rows.length
      ? rows.reduce((sum, log) => sum + log.weight, 0) / rows.length
      : null
    return Promise.resolve(average)
  }

  update(
    id: string,
    data: {
      goalId?: string | null
      weight?: number
      note?: string | null
      date?: Date
    }
  ): Promise<WeightLog> {
    const log = this.items.find((item) => item.id === id)
    if (!log) {
      return Promise.reject(new Error('Log not found'))
    }
    Object.assign(log, data)
    return Promise.resolve(log)
  }

  delete(id: string): Promise<void> {
    this.items = this.items.filter((log) => log.id !== id)
    return Promise.resolve()
  }
}
