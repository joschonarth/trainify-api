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

describe('credit scheduled training days', () => {
  it('rejects unknown users before creating activity', async () => {
    await expect(
      context.update.execute({ userId: 'missing', logDate: new Date() })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
    expect(context.logs.items).toHaveLength(0)
  })
  it('counts fulfilled training days across rest', async () => {
    await context.credit('2026-11-16')
    await context.credit('2026-11-17')
    expect(await context.credit('2026-11-19')).toMatchObject({
      currentStreak: 3,
      bestStreak: 3,
    })
  })
  it('does not count activity on rest or repair a missed training day', async () => {
    await context.credit('2026-11-16')
    expect(await context.credit('2026-11-18')).toMatchObject({
      currentStreak: 0,
      bestStreak: 1,
    })
    expect(await context.credit('2026-11-19')).toMatchObject({
      currentStreak: 1,
      bestStreak: 1,
    })
    expect(context.logs.items).toHaveLength(3)
  })
  it('records activity while unconfigured without starting a streak', async () => {
    context.plans.items.clear()
    expect(await context.credit('2026-11-19')).toMatchObject({
      enabled: false,
      currentStreak: 0,
    })
    expect(context.logs.items).toHaveLength(1)
    expect(context.streaks.items).toHaveLength(0)
  })
  it('deduplicates retries and concurrent completions', async () => {
    await Promise.all(
      Array.from({ length: 10 }, () => context.credit('2026-11-19'))
    )
    expect(context.logs.items).toHaveLength(1)
    expect(context.streaks.items).toHaveLength(1)
    expect(context.streaks.items[0]?.currentStreak).toBe(1)
  })
  it('recovers out-of-order rewards using the original date', async () => {
    await context.credit('2026-11-16')
    await context.credit('2026-11-19')
    expect(await context.credit('2026-11-17')).toMatchObject({
      currentStreak: 3,
      bestStreak: 3,
      lastBusinessDate: '2026-11-19',
    })
    expect(await context.credit('2026-11-17')).toMatchObject({
      currentStreak: 3,
    })
    expect(context.logs.items).toHaveLength(3)
  })
  it('uses the fixed timezone when creditDay is omitted', async () => {
    await context.users.update('user', { timezone: 'Asia/Tokyo' })
    vi.setSystemTime(new Date('2026-11-20T02:59:00Z'))
    const result = await context.update.execute({
      userId: 'user',
      logDate: new Date(),
    })
    expect(result.lastBusinessDate).toBe('2026-11-19')
  })
  it('restores a historical record after the current streak has ended', async () => {
    await context.users.update('user', { timezone: 'Asia/Tokyo' })
    const plan = context.plans.items.get('user')
    if (!plan) {
      throw new Error('Missing plan fixture')
    }
    plan.versions.push({ effectiveDate: '2026-11-20', workouts: {} })
    vi.setSystemTime(new Date('2026-11-23T15:00:00Z'))

    await context.credit('2026-11-19')
    await context.credit('2026-11-17')
    expect(await context.credit('2026-11-16')).toMatchObject({
      currentStreak: 0,
      bestStreak: 3,
      lastBusinessDate: '2026-11-19',
    })
    expect(context.logs.items).toHaveLength(3)
  })
  it('does not reuse preactivation activity after a new plan starts', async () => {
    const plan = context.plans.items.get('user')
    if (!plan?.versions[0]) {
      throw new Error('Missing plan fixture')
    }
    plan.activationDate = '2026-11-19'
    plan.versions[0].effectiveDate = '2026-11-19'
    await context.credit('2026-11-16')
    expect(await context.credit('2026-11-19')).toMatchObject({
      currentStreak: 1,
      bestStreak: 1,
    })
  })
  it('rolls back new activity on counter persistence failure and allows retry', async () => {
    vi.spyOn(context.streaks, 'create').mockRejectedValueOnce(
      new Error('storage failed')
    )
    await expect(context.credit('2026-11-19')).rejects.toThrow('storage failed')
    expect(context.logs.items).toHaveLength(0)
    expect(context.streaks.items).toHaveLength(0)
    expect(await context.credit('2026-11-19')).toMatchObject({
      currentStreak: 1,
    })
  })
})
