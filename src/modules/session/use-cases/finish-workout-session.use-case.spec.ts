import { type WorkoutSession, WorkoutSessionStatus } from 'generated/prisma'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { WorkoutSessionAlreadyCompletedError } from '../errors/workout-session-already-completed.error'
import { WorkoutSessionNotStartedError } from '../errors/workout-session-not-started.error'
import type { WorkoutSessionsRepository } from '../repositories/workout-sessions.repository'
import { FinishWorkoutSessionUseCase } from './finish-workout-session.use-case'

const userId = 'user-id'
const sessionId = 'session-id'
let session: WorkoutSession
let repository: Pick<WorkoutSessionsRepository, 'findById' | 'update'>
let sut: FinishWorkoutSessionUseCase

describe('FinishWorkoutSessionUseCase', () => {
  beforeEach(() => {
    session = {
      id: sessionId,
      date: new Date(),
      status: WorkoutSessionStatus.IN_PROGRESS,
      startedAt: new Date(Date.now() - 5000),
      endedAt: null,
      duration: null,
      userId,
      workoutId: 'workout-id',
    }
    repository = {
      findById: vi.fn(async () => session),
      update: vi.fn(async (_id, data) => Object.assign(session, data)),
    }
    sut = new FinishWorkoutSessionUseCase(repository)
  })

  it('finishes an in-progress session and records its duration', async () => {
    const { session: updated } = await sut.execute({ userId, sessionId })

    expect(updated?.endedAt).toBeInstanceOf(Date)
    expect(updated?.duration).toBeGreaterThanOrEqual(5)
    expect(repository.update).toHaveBeenCalledWith(
      sessionId,
      expect.objectContaining({ endedAt: expect.any(Date) })
    )
  })

  it('rejects finishing a session that has not started', async () => {
    session.status = WorkoutSessionStatus.PENDING
    session.startedAt = null

    await expect(sut.execute({ userId, sessionId })).rejects.toBeInstanceOf(
      WorkoutSessionNotStartedError
    )
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('rejects finishing a session more than once', async () => {
    session.endedAt = new Date()

    await expect(sut.execute({ userId, sessionId })).rejects.toBeInstanceOf(
      WorkoutSessionAlreadyCompletedError
    )
    expect(repository.update).not.toHaveBeenCalled()
  })

  it.each([
    WorkoutSessionStatus.COMPLETED,
    WorkoutSessionStatus.INCOMPLETE,
    WorkoutSessionStatus.SKIPPED,
  ])('rejects finishing a terminal %s session', async (status) => {
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
