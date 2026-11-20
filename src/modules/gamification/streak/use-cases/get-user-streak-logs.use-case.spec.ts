import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUserStreakLogsRepository } from '../repositories/in-memory/in-memory-user-streak-logs.repository'
import { GetUserStreakLogsUseCase } from './get-user-streak-logs.use-case'

let logs: InMemoryUserStreakLogsRepository
let sut: GetUserStreakLogsUseCase

describe('Get user streak logs', () => {
  beforeEach(async () => {
    logs = new InMemoryUserStreakLogsRepository()
    sut = new GetUserStreakLogsUseCase(logs)
    for (const date of [
      '2026-06-12T12:00:00Z',
      '2026-06-10T12:00:00Z',
      '2026-06-11T12:00:00Z',
    ]) {
      await logs.create({ userId: 'user', date: new Date(date) })
    }
    await logs.create({
      userId: 'other',
      date: new Date('2026-06-11T12:00:00Z'),
    })
  })

  it('should return only the user logs in date order without mutating stored activity', async () => {
    const before = structuredClone(logs.items)
    const { logs: result } = await sut.execute({ userId: 'user' })
    expect(result.map((log) => log.date.toISOString())).toEqual([
      '2026-06-10T12:00:00.000Z',
      '2026-06-11T12:00:00.000Z',
      '2026-06-12T12:00:00.000Z',
    ])
    expect(result.every((log) => log.userId === 'user')).toBe(true)
    expect(logs.items).toEqual(before)
  })

  it('should apply inclusive date bounds when both are supplied', async () => {
    const { logs: result } = await sut.execute({
      userId: 'user',
      startDate: new Date('2026-06-10T12:00:00Z'),
      endDate: new Date('2026-06-11T12:00:00Z'),
    })
    expect(result.map((log) => log.date.toISOString())).toEqual([
      '2026-06-10T12:00:00.000Z',
      '2026-06-11T12:00:00.000Z',
    ])
  })

  it.each([
    'startDate',
    'endDate',
  ] as const)('should preserve the existing unfiltered behavior when only %s is supplied', async (field) => {
    const result = await sut.execute({
      userId: 'user',
      [field]: new Date('2026-06-11T12:00:00Z'),
    })
    expect(result.logs).toHaveLength(3)
  })

  it('should return an empty list for a user without logs or a range without activity', async () => {
    expect(await sut.execute({ userId: 'missing' })).toEqual({ logs: [] })
    expect(
      await sut.execute({
        userId: 'user',
        startDate: new Date('2026-07-01T00:00:00Z'),
        endDate: new Date('2026-07-31T00:00:00Z'),
      })
    ).toEqual({ logs: [] })
  })
})
