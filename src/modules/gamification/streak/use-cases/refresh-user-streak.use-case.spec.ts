import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { makePlannedStreakContext } from '../tests/make-planned-streak-context'

let context: Awaited<ReturnType<typeof makePlannedStreakContext>>
beforeEach(async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-19T15:00:00Z'))
  context = await makePlannedStreakContext()
})
afterEach(() => vi.useRealTimers())

describe('refresh scheduled streak', () => {
  it('rejects unknown users', async () => {
    await expect(
      context.refresh.execute({ userId: 'missing' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
  it('does not create activity or counters for an unconfigured user', async () => {
    context.plans.items.clear()
    expect(await context.refresh.execute({ userId: 'user' })).toMatchObject({
      enabled: false,
      currentStreak: 0,
    })
    expect(context.logs.items).toHaveLength(0)
    expect(context.streaks.items).toHaveLength(0)
  })
  it('reconstructs counters from actual activity without changing it', async () => {
    await context.recordActivity('2026-11-16')
    await context.recordActivity('2026-11-17')
    await context.recordActivity('2026-11-19')
    const activity = structuredClone(context.logs.items)
    expect(await context.refresh.execute({ userId: 'user' })).toMatchObject({
      currentStreak: 3,
      bestStreak: 3,
      enabled: true,
    })
    expect(context.streaks.items[0]).toMatchObject({
      currentStreak: 3,
      bestStreak: 3,
    })
    expect(context.logs.items).toEqual(activity)
  })
  it('persists a closed miss while preserving the record', async () => {
    await context.recordActivity('2026-11-16')
    await context.recordActivity('2026-11-17')
    vi.setSystemTime(new Date('2026-11-21T15:00:00Z'))
    expect(await context.refresh.execute({ userId: 'user' })).toMatchObject({
      currentStreak: 0,
      bestStreak: 2,
    })
  })
  it('rolls back a persistence failure and allows recovery', async () => {
    await context.recordActivity('2026-11-19')
    await context.streaks.create({
      user: { connect: { id: 'user' } },
      currentStreak: 0,
      bestStreak: 0,
    })
    const before = structuredClone({
      logs: context.logs.items,
      streaks: context.streaks.items,
    })
    vi.spyOn(context.streaks, 'update').mockRejectedValueOnce(
      new Error('storage failed')
    )
    await expect(context.refresh.execute({ userId: 'user' })).rejects.toThrow(
      'storage failed'
    )
    expect({
      logs: context.logs.items,
      streaks: context.streaks.items,
    }).toEqual(before)
    expect(await context.refresh.execute({ userId: 'user' })).toMatchObject({
      currentStreak: 1,
    })
  })
  it('serializes concurrent refreshes without creating duplicate counters', async () => {
    await Promise.all(
      Array.from({ length: 8 }, () =>
        context.refresh.execute({ userId: 'user' })
      )
    )
    expect(context.streaks.items).toHaveLength(1)
    expect(context.logs.items).toHaveLength(0)
  })
})
