import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'
import { InMemoryWorkoutSchedulesRepository } from '@/modules/workout/repositories/in-memory/in-memory-workout-schedules.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryWorkoutSessionsRepository } from '../repositories/in-memory/in-memory-workout-sessions.repository'
import {
  makeDailySchedule,
  makeDailySession,
} from '../tests/factories/make-daily-session'
import { GetDailyWorkoutSessionUseCase } from './get-daily-workout-session.use-case'

let sessions: InMemoryWorkoutSessionsRepository
let schedules: InMemoryWorkoutSchedulesRepository
let users: InMemoryUsersRepository
let sut: GetDailyWorkoutSessionUseCase
const request = { userId: 'user' }

describe('GetDailyWorkoutSessionUseCase', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
    sessions = new InMemoryWorkoutSessionsRepository()
    schedules = new InMemoryWorkoutSchedulesRepository()
    users = new InMemoryUsersRepository()
    await makeUser(users, { id: 'user' })
    schedules.schedulesWithWorkouts = [makeDailySchedule()]
    sut = new GetDailyWorkoutSessionUseCase(sessions, schedules, users)
  })
  afterEach(() => vi.useRealTimers())

  it('should create one pending session with planned exercise defaults', async () => {
    const { session } = await sut.execute(request)
    expect(session.status).toBe('PENDING')
    expect(session.exerciseSessions).toHaveLength(1)
    expect(session.exerciseSessions[0]).toMatchObject({
      plannedSets: 3,
      plannedReps: 10,
      plannedWeight: 20,
    })
    expect(sessions.dailyIdentities[0]).toMatchObject({
      businessDate: '2026-01-01',
      timezone: 'America/Sao_Paulo',
    })
  })
  it('should return the same session for concurrent requests without duplicating children', async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }, () => sut.execute(request))
    )
    expect(new Set(results.map((result) => result.session.id)).size).toBe(1)
    expect(sessions.items).toHaveLength(1)
    expect(sessions.dailyIdentities).toHaveLength(1)
    expect(results[0]?.session.exerciseSessions).toHaveLength(1)
  })
  it('should return existing terminal history without requiring a schedule', async () => {
    const legacy = makeDailySession({
      status: 'COMPLETED',
      endedAt: new Date(),
    })
    sessions.items.push(legacy)
    sessions.details.set(legacy.id, legacy)
    schedules.schedulesWithWorkouts = []
    expect((await sut.execute(request)).session.id).toBe(legacy.id)
  })
  it('should adopt legacy duplicates deterministically without deleting history', async () => {
    const a = makeDailySession({ id: 'a' })
    const b = makeDailySession({ id: 'b' })
    sessions.items.push(b, a)
    sessions.details.set(a.id, a)
    sessions.details.set(b.id, b)
    expect((await sut.execute(request)).session.id).toBe('a')
    expect(sessions.items).toHaveLength(2)
    expect(sessions.dailyIdentities).toHaveLength(1)
  })
  it('should reject unknown users', async () => {
    await expect(sut.execute({ userId: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError
    )
    expect(sessions.items).toHaveLength(0)
  })
  it('should reject days without a scheduled workout', async () => {
    schedules.schedulesWithWorkouts = []
    await expect(sut.execute(request)).rejects.toThrow(
      'No workout scheduled for today.'
    )
    expect(sessions.items).toHaveLength(0)
  })
  it('should reject empty workouts and workouts with only archived exercises', async () => {
    const schedule = makeDailySchedule()
    const exercise = schedule.workout.exercises[0]
    if (!exercise) {
      throw new Error('Missing fixture')
    }
    exercise.exercise.archivedAt = new Date()
    schedules.schedulesWithWorkouts = [schedule]
    await expect(sut.execute(request)).rejects.toThrow(
      'The scheduled workout has no active exercises.'
    )
    schedule.workout.exercises = []
    await expect(sut.execute(request)).rejects.toBeInstanceOf(
      ResourceNotFoundError
    )
    expect(sessions.items).toHaveLength(0)
  })
  it('should exclude archived exercises from new snapshots', async () => {
    const schedule = makeDailySchedule()
    const exercise = schedule.workout.exercises[0]
    if (!exercise) {
      throw new Error('Missing fixture')
    }
    schedule.workout.exercises.push({
      ...exercise,
      id: 'archived',
      exercise: {
        ...exercise.exercise,
        id: 'archived',
        archivedAt: new Date(),
      },
    })
    schedules.schedulesWithWorkouts = [schedule]
    expect((await sut.execute(request)).session.exerciseSessions).toHaveLength(
      1
    )
  })
  it('should preserve a pending snapshot after schedule changes', async () => {
    const first = await sut.execute(request)
    schedules.schedulesWithWorkouts = []
    const second = await sut.execute(request)
    expect(second.session).toEqual(first.session)
  })
  it.each([
    ['2026-01-01T01:00:00Z', 'America/Sao_Paulo', '2025-12-31', 3],
    ['2026-03-01T01:00:00Z', 'America/Sao_Paulo', '2026-02-28', 6],
    ['2026-12-31T12:00:00Z', 'Pacific/Kiritimati', '2027-01-01', 5],
  ])('should use the business date at %s in %s', async (now, timezone, date, weekday) => {
    vi.setSystemTime(new Date(now))
    await users.update('user', { timezone })
    schedules.schedulesWithWorkouts = [makeDailySchedule(weekday)]
    await sut.execute(request)
    expect(sessions.dailyIdentities[0]?.businessDate).toBe(date)
  })
  it('should keep the existing daily identity after changing timezone on the same date', async () => {
    const first = await sut.execute(request)
    await users.update('user', { timezone: 'Europe/London' })
    expect((await sut.execute(request)).session.id).toBe(first.session.id)
    expect(sessions.dailyIdentities[0]?.timezone).toBe('America/Sao_Paulo')
  })
  it('should create a new identity on a new local date without relabeling a previous session', async () => {
    const first = await sut.execute(request)
    await users.update('user', { timezone: 'Pacific/Kiritimati' })
    schedules.schedulesWithWorkouts = [makeDailySchedule(5)]
    expect((await sut.execute(request)).session.id).not.toBe(first.session.id)
    expect(sessions.dailyIdentities.map((item) => item.businessDate)).toEqual([
      '2026-01-01',
      '2026-01-02',
    ])
  })
  it.each([
    ['2026-03-08T16:00:00Z', '2026-03-09T03:59:59.999Z'],
    ['2026-11-01T16:00:00Z', '2026-11-02T04:59:59.999Z'],
  ])('should include the final local instant of a daylight saving transition day', async (now, lastInstant) => {
    vi.setSystemTime(new Date(now))
    await users.update('user', { timezone: 'America/New_York' })
    const legacy = makeDailySession({ date: new Date(lastInstant) })
    sessions.items.push(legacy)
    sessions.details.set(legacy.id, legacy)
    schedules.schedulesWithWorkouts = []
    expect((await sut.execute(request)).session.id).toBe(legacy.id)
  })
})
