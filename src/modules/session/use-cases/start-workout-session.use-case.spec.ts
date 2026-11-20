import { type WorkoutSession, WorkoutSessionStatus } from 'generated/prisma'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { WorkoutSessionAlreadyCompletedError } from '../errors/workout-session-already-completed.error'
import { WorkoutSessionAlreadyInProgressError } from '../errors/workout-session-already-in-progress.error'
import type { WorkoutSessionsRepository } from '../repositories/workout-sessions.repository'
import { StartWorkoutSessionUseCase } from './start-workout-session.use-case'

const userId = 'user-id'
const sessionId = 'session-id'
let session: WorkoutSession
let repository: Pick<WorkoutSessionsRepository, 'findById' | 'update'>
let sut: StartWorkoutSessionUseCase

describe('StartWorkoutSessionUseCase', () => {
  beforeEach(() => {
    session = {
      id: sessionId,
      date: new Date(),
      status: WorkoutSessionStatus.PENDING,
      startedAt: null,
      endedAt: null,
      duration: null,
      userId,
      workoutId: 'workout-id',
    }
    repository = {
      findById: vi.fn(async () => session),
      update: vi.fn(async (_id, data) => Object.assign(session, data)),
    }
    sut = new StartWorkoutSessionUseCase(repository)
  })

  it('starts a pending session and clears stale duration', async () => {
    session.duration = 42

    await sut.execute({ userId, sessionId })

    expect(repository.update).toHaveBeenCalledWith(
      sessionId,
      expect.objectContaining({
        status: WorkoutSessionStatus.IN_PROGRESS,
        endedAt: null,
        duration: null,
      })
    )
  })

  it('does not start a session that is already in progress', async () => {
    session.status = WorkoutSessionStatus.IN_PROGRESS

    await expect(sut.execute({ userId, sessionId })).rejects.toBeInstanceOf(
      WorkoutSessionAlreadyInProgressError
    )
    expect(repository.update).not.toHaveBeenCalled()
  })

  it.each([
    WorkoutSessionStatus.COMPLETED,
    WorkoutSessionStatus.INCOMPLETE,
    WorkoutSessionStatus.SKIPPED,
  ])('does not reopen a %s session', async (status) => {
    session.status = status

    await expect(sut.execute({ userId, sessionId })).rejects.toBeInstanceOf(
      WorkoutSessionAlreadyCompletedError
    )
    expect(repository.update).not.toHaveBeenCalled()
  })
  it('should reject foreign and missing sessions without changing them', async () => {
    await expect(
      sut.execute({ userId: 'other', sessionId })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
    repository.findById = () => Promise.resolve(null)
    await expect(sut.execute({ userId, sessionId })).rejects.toBeInstanceOf(
      ResourceNotFoundError
    )
    expect(repository.update).not.toHaveBeenCalled()
  })
  it('rejects an expired session without writing', async () => {
    session.date = new Date('2000-01-01T12:00:00Z')
    await expect(sut.execute({ userId, sessionId })).rejects.toMatchObject({
      statusCode: 409,
    })
    expect(repository.update).not.toHaveBeenCalled()
  })
})
