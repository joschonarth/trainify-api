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

describe('read scheduled streak', () => {
  it('does not create records before the first activity', async () => {
    expect(await context.read.execute('user')).toMatchObject({
      enabled: true,
      currentStreak: 0,
      bestStreak: 0,
      unit: 'scheduled_training_days',
    })
    expect(context.streaks.items).toHaveLength(0)
    expect(context.logs.items).toHaveLength(0)
  })
  it('rejects an unknown user', async () => {
    await expect(context.read.execute('missing')).rejects.toBeInstanceOf(
      ResourceNotFoundError
    )
  })
  it('does not mistake an absent schedule for rest', async () => {
    context.plans.items.clear()
    expect(await context.read.execute('user')).toMatchObject({
      enabled: false,
      timezone: null,
      activationDate: null,
      currentStreak: 0,
    })
  })
  it('does not enable the next day plan today', async () => {
    const plan = context.plans.items.get('user')
    if (!plan?.versions[0]) {
      throw new Error('Missing plan fixture')
    }
    plan.activationDate = '2026-11-20'
    plan.versions[0].effectiveDate = '2026-11-20'
    expect(await context.read.execute('user')).toMatchObject({
      enabled: false,
      currentStreak: 0,
    })
  })
  it.each([
    ['2026-11-18T15:00:00Z', 2],
    ['2026-11-20T02:59:59Z', 2],
    ['2026-11-20T03:00:00Z', 0],
  ])('treats rest and closed misses correctly at %s', async (instant, currentStreak) => {
    await context.recordActivity('2026-11-16')
    await context.recordActivity('2026-11-17')
    vi.setSystemTime(new Date(instant))
    const before = structuredClone(context.streaks.items)
    expect(await context.read.execute('user')).toMatchObject({
      currentStreak,
      bestStreak: 2,
    })
    expect(context.streaks.items).toEqual(before)
  })
  it('keeps the fixed timezone when the profile moves ahead', async () => {
    await context.recordActivity('2026-11-16')
    await context.recordActivity('2026-11-17')
    await context.users.update('user', { timezone: 'Asia/Tokyo' })
    vi.setSystemTime(new Date('2026-11-20T02:59:59Z'))
    expect(await context.read.execute('user')).toMatchObject({
      currentStreak: 2,
      timezone: 'America/Sao_Paulo',
    })
  })
  it.each([
    ['2026-03-06', '2026-03-09', '2026-03-09T16:00:00Z'],
    ['2026-10-30', '2026-11-02', '2026-11-02T17:00:00Z'],
  ])('preserves weekend rest across DST from %s to %s', async (friday, monday, reference) => {
    context.plans.items.set('user', {
      timezone: 'America/New_York',
      activationDate: friday,
      versions: [{ effectiveDate: friday, workouts: { 1: 'a', 5: 'b' } }],
    })
    await context.recordActivity(friday)
    await context.recordActivity(monday)
    vi.setSystemTime(new Date(reference))
    expect(await context.read.execute('user')).toMatchObject({
      currentStreak: 2,
      bestStreak: 2,
    })
  })
  it('ends the sequence when disabled and keeps its record after reactivation', async () => {
    context.plans.items.set('user', {
      timezone: 'America/Sao_Paulo',
      activationDate: '2026-11-16',
      versions: [
        { effectiveDate: '2026-11-16', workouts: { 1: 'a', 2: 'b' } },
        { effectiveDate: '2026-11-18', workouts: {} },
        { effectiveDate: '2026-11-23', workouts: { 1: 'a' } },
      ],
    })
    for (const date of ['2026-11-16', '2026-11-17', '2026-11-23']) {
      await context.recordActivity(date)
    }
    expect(await context.read.execute('user')).toMatchObject({
      enabled: false,
      currentStreak: 0,
      bestStreak: 2,
    })
    vi.setSystemTime(new Date('2026-11-23T15:00:00Z'))
    expect(await context.read.execute('user')).toMatchObject({
      enabled: true,
      currentStreak: 1,
      bestStreak: 2,
    })
  })
})
