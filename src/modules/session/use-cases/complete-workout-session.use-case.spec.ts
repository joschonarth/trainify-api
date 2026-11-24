import { type ExerciseLog, WorkoutSessionStatus } from 'generated/prisma'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ExerciseLogsRepository } from '@/modules/exercise/repositories/exercise-logs.repository'
import type {
  ExerciseSessionsRepository,
  ExerciseSessionWithLogs,
} from '@/modules/session/repositories/exercise-sessions.repository'
import type {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '@/modules/session/repositories/workout-sessions.repository'
import { DuplicateExerciseCompletionError } from '../errors/duplicate-exercise-completion.error'
import { WorkoutSessionAlreadyCompletedError } from '../errors/workout-session-already-completed.error'
import {
  type SessionEventProcessingRepository,
  type SessionGamification,
  type WorkoutFinalizedV1,
  workoutFinalizedV1Schema,
} from '../events/workout-finalized-v1'
import { InMemoryWorkoutSessionCompletionsRepository } from '../repositories/in-memory/in-memory-workout-session-completions.repository'
import type { SessionCompletionUnitOfWork } from '../repositories/session-completion-unit-of-work'
import { completeWorkoutSessionBodySchema } from '../schemas/complete-workout-session.schema'
import { CompleteWorkoutSessionUseCase } from './complete-workout-session.use-case'

const userId = 'user-id'
const sessionId = 'workout-session-id'

let exerciseSessions: ExerciseSessionWithLogs[]
let workoutSession: WorkoutSessionWithWorkout
let workoutSessionsRepository: Pick<
  WorkoutSessionsRepository,
  'findByIdWithWorkout' | 'update'
>
let exerciseSessionsRepository: Pick<
  ExerciseSessionsRepository,
  'findByWorkoutSessionId' | 'update'
>
let exerciseLogsRepository: Pick<ExerciseLogsRepository, 'create'>
let sut: CompleteWorkoutSessionUseCase
let completions: InMemoryWorkoutSessionCompletionsRepository
let events: WorkoutFinalizedV1[]
let processings: (Parameters<
  SessionEventProcessingRepository['createPending']
>[0] & { status: SessionGamification['status'] })[]
let createPending: SessionEventProcessingRepository['createPending']
let logs: ExerciseLog[]

function makeExerciseSession(
  overrides: Partial<ExerciseSessionWithLogs> = {}
): ExerciseSessionWithLogs {
  return {
    id: 'exercise-session-id',
    completed: false,
    skipReason: null,
    plannedSets: null,
    plannedReps: null,
    plannedWeight: null,
    position: 0,
    startedAt: null,
    endedAt: null,
    duration: null,
    workoutSessionId: sessionId,
    exerciseId: 'exercise-id',
    exercise: {
      id: 'exercise-id',
      name: 'Bench Press',
      category: null,
      type: null,
      measurement: 'REPS' as const,
    },
    logs: [],
    ...overrides,
  }
}

function makeExerciseLog(): ExerciseLog {
  return {
    id: 'exercise-log-id',
    sets: 3,
    reps: 10,
    weight: 20,
    volume: 600,
    description: null,
    date: new Date('2026-01-01T12:00:00.000Z'),
    exerciseSessionId: 'exercise-session-id',
    userId,
    exerciseId: 'exercise-id',
  }
}

function getFirstExerciseSession(): ExerciseSessionWithLogs {
  const exerciseSession = exerciseSessions[0]
  if (!exerciseSession) {
    throw new Error('Test exercise session is missing.')
  }
  return exerciseSession
}

describe('CompleteWorkoutSessionUseCase', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
    exerciseSessions = [makeExerciseSession()]
    events = []
    processings = []
    logs = []
    createPending = vi.fn<SessionEventProcessingRepository['createPending']>(
      (identity) => {
        processings.push({ ...identity, status: 'PENDING' })
        return Promise.resolve({
          processingId: identity.eventId,
          status: 'PENDING',
        })
      }
    )

    workoutSession = {
      id: sessionId,
      date: new Date('2026-01-01T12:00:00.000Z'),
      status: WorkoutSessionStatus.IN_PROGRESS,
      startedAt: null,
      endedAt: null,
      duration: null,
      userId,
      workoutId: 'workout-id',
      workout: {
        id: 'workout-id',
        name: 'Workout',
        exercises: [],
      },
      exerciseSessions: [],
    }

    const findByIdWithWorkout: WorkoutSessionsRepository['findByIdWithWorkout'] =
      async () => workoutSession
    const updateWorkoutSession: WorkoutSessionsRepository['update'] = (
      _id,
      data
    ) => {
      if (data.endedAt instanceof Date) {
        workoutSession.endedAt = data.endedAt
      }
      if (typeof data.duration === 'number') {
        workoutSession.duration = data.duration
      }
      if (typeof data.status === 'string') {
        workoutSession.status = data.status
      }
      return Promise.resolve(workoutSession)
    }

    workoutSessionsRepository = {
      findByIdWithWorkout: vi.fn(findByIdWithWorkout),
      update: vi.fn(updateWorkoutSession),
    }

    const findByWorkoutSessionId: ExerciseSessionsRepository['findByWorkoutSessionId'] =
      async () => exerciseSessions
    const updateExerciseSession: ExerciseSessionsRepository['update'] = (
      id,
      data
    ) => {
      const exerciseSession = exerciseSessions.find((item) => item.id === id)
      if (!exerciseSession) {
        return Promise.reject(new Error('Exercise session not found.'))
      }
      if (typeof data.completed === 'boolean') {
        exerciseSession.completed = data.completed
      }
      if (typeof data.skipReason === 'string' || data.skipReason === null) {
        exerciseSession.skipReason = data.skipReason
      }
      return Promise.resolve(exerciseSession)
    }

    exerciseSessionsRepository = {
      findByWorkoutSessionId: vi.fn(findByWorkoutSessionId),
      update: vi.fn(updateExerciseSession),
    }

    const createExerciseLog: ExerciseLogsRepository['create'] = () => {
      const log = makeExerciseLog()
      logs.push(log)
      return Promise.resolve(log)
    }
    exerciseLogsRepository = {
      create: vi.fn(createExerciseLog),
    }

    completions = new InMemoryWorkoutSessionCompletionsRepository()
    let queue: Promise<unknown> = Promise.resolve()
    const unitOfWork: SessionCompletionUnitOfWork = {
      execute: (_id, operation) => {
        const result = queue.then(async () => {
          const before = structuredClone({
            workoutSession,
            exerciseSessions,
            completions: completions.items,
            events,
            processings,
            logs,
          })
          try {
            return await operation({
              workoutSessions: workoutSessionsRepository,
              exerciseSessions: exerciseSessionsRepository,
              exerciseLogs: exerciseLogsRepository,
              completions,
              outbox: {
                create(event) {
                  events.push(workoutFinalizedV1Schema.parse(event))
                  return Promise.resolve()
                },
              },
              processings: {
                createPending,
                findBySessionId(id, ownerId) {
                  const processing = processings.find(
                    (item) => item.sessionId === id && item.userId === ownerId
                  )
                  return Promise.resolve(
                    processing
                      ? {
                          processingId: processing.eventId,
                          status: processing.status,
                        }
                      : null
                  )
                },
              },
            })
          } catch (error) {
            workoutSession = before.workoutSession
            exerciseSessions = before.exerciseSessions
            completions.items = before.completions
            events = before.events
            processings = before.processings
            logs = before.logs
            throw error
          }
        })
        queue = result.catch(() => undefined)
        return result
      },
    }

    sut = new CompleteWorkoutSessionUseCase(unitOfWork)
  })

  it('does not create exercise logs for exercises that were not completed', async () => {
    await sut.execute({
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          weight: 20,
          completed: false,
        },
      ],
    })

    expect(exerciseLogsRepository.create).not.toHaveBeenCalled()
    expect(events[0]?.data).toMatchObject({
      status: 'SKIPPED',
      hasActivity: false,
    })
    expect(exerciseSessionsRepository.update).toHaveBeenCalledWith(
      'exercise-session-id',
      { completed: false, skipReason: null }
    )
  })

  it('rejects duplicate exercise session entries before writing', async () => {
    const completedExercise = {
      exerciseSessionId: 'exercise-session-id',
      sets: 3,
      reps: 10,
      weight: 20,
      completed: true,
    }

    await expect(
      sut.execute({
        userId,
        sessionId,
        exercises: [completedExercise, completedExercise],
      })
    ).rejects.toBeInstanceOf(DuplicateExerciseCompletionError)

    expect(exerciseLogsRepository.create).not.toHaveBeenCalled()
    expect(exerciseSessionsRepository.update).not.toHaveBeenCalled()
  })

  it('rejects an exercise session that does not belong to the workout session', async () => {
    await expect(
      sut.execute({
        userId,
        sessionId,
        exercises: [
          {
            exerciseSessionId: 'another-session-exercise-id',
            sets: 3,
            reps: 10,
            completed: true,
          },
        ],
      })
    ).rejects.toMatchObject({ statusCode: 404 })

    expect(exerciseLogsRepository.create).not.toHaveBeenCalled()
    expect(exerciseSessionsRepository.update).not.toHaveBeenCalled()
  })

  it('does not create another log for an ExerciseSession that already has one', async () => {
    getFirstExerciseSession().logs.push(makeExerciseLog())

    await sut.execute({
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          weight: 20,
          completed: true,
        },
      ],
    })

    expect(exerciseLogsRepository.create).not.toHaveBeenCalled()
  })

  it('persists zero volume when a completed exercise has no weight', async () => {
    await sut.execute({
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          completed: true,
        },
      ],
    })

    expect(exerciseLogsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        weight: null,
        volume: 0,
      })
    )
  })

  it('creates a log and completes an exercise even when it misses planned reps', async () => {
    getFirstExerciseSession().plannedReps = 20

    await sut.execute({
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 15,
          weight: 20,
          completed: true,
        },
      ],
    })

    expect(exerciseLogsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sets: 3,
        reps: 15,
        weight: 20,
        volume: 900,
      })
    )
    expect(exerciseSessionsRepository.update).toHaveBeenCalledWith(
      'exercise-session-id',
      { completed: true, skipReason: null }
    )
  })

  it('persists skip reason only for exercises that were not completed', async () => {
    await sut.execute({
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          completed: false,
          skipReason: 'knee pain',
        },
      ],
    })

    expect(exerciseSessionsRepository.update).toHaveBeenCalledWith(
      'exercise-session-id',
      { completed: false, skipReason: 'knee pain' }
    )
  })

  it('rejects completing an already completed workout session before any writes', async () => {
    workoutSession.status = WorkoutSessionStatus.COMPLETED

    await expect(
      sut.execute({ userId, sessionId, exercises: [] })
    ).rejects.toBeInstanceOf(WorkoutSessionAlreadyCompletedError)

    expect(exerciseLogsRepository.create).not.toHaveBeenCalled()
    expect(exerciseSessionsRepository.update).not.toHaveBeenCalled()
    expect(workoutSessionsRepository.update).not.toHaveBeenCalled()
  })

  it('allows completion after the timer is finished without overwriting timing', async () => {
    const endedAt = new Date('2026-01-01T01:00:00.000Z')
    workoutSession.startedAt = new Date('2026-01-01T00:00:00.000Z')
    workoutSession.endedAt = endedAt
    workoutSession.duration = 3600

    await sut.execute({
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          completed: false,
        },
      ],
    })

    expect(workoutSessionsRepository.update).toHaveBeenCalledWith(sessionId, {
      endedAt,
      duration: 3600,
      status: WorkoutSessionStatus.SKIPPED,
    })
  })

  it('should return the recorded skipped session on a repeated completion', async () => {
    const request = {
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          completed: false,
        },
      ],
    }

    await sut.execute(request)

    const response = await sut.execute(request)
    expect(response.session?.status).toBe(WorkoutSessionStatus.SKIPPED)
    expect(response.gamification).toEqual({
      processingId: events[0]?.eventId,
      status: 'PENDING',
    })
    expect(exerciseLogsRepository.create).not.toHaveBeenCalled()
    expect(workoutSessionsRepository.update).toHaveBeenCalledTimes(1)
  })

  it('trims and limits skip reason in the request schema', () => {
    const parsed = completeWorkoutSessionBodySchema.parse({
      exercises: [
        {
          exerciseSessionId: `c${'a'.repeat(24)}`,
          sets: 3,
          reps: 10,
          completed: false,
          skipReason: '  pain  ',
        },
      ],
    })

    expect(parsed.exercises.at(0)?.skipReason).toBe('pain')
    expect(
      completeWorkoutSessionBodySchema.safeParse({
        exercises: [
          {
            exerciseSessionId: `c${'a'.repeat(24)}`,
            sets: 3,
            reps: 10,
            completed: false,
            skipReason: 'x'.repeat(256),
          },
        ],
      }).success
    ).toBe(false)
    expect(
      completeWorkoutSessionBodySchema.safeParse({
        exercises: [
          {
            exerciseSessionId: `c${'a'.repeat(24)}`,
            sets: 3,
            reps: 10,
            completed: true,
            skipReason: 'not skipped',
          },
        ],
      }).success
    ).toBe(false)
  })
  it('should store payload seconds and zero load volume for duration exercises', async () => {
    const exercise = getFirstExerciseSession()
    exercise.exercise.measurement = 'DURATION'
    exercise.startedAt = new Date('2026-01-01T00:00:00Z')
    exercise.endedAt = new Date('2026-01-01T00:10:00Z')
    exercise.duration = 600
    await sut.execute({
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: exercise.id,
          sets: 2,
          reps: 30,
          weight: 60,
          completed: true,
        },
      ],
    })
    expect(exerciseLogsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ sets: 2, reps: 30, weight: 60, volume: 0 })
    )
  })
  afterEach(() => vi.useRealTimers())

  it('returns the pending processing identity together with the completed session', async () => {
    const result = await sut.execute({
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          completed: true,
        },
      ],
    })
    expect(result.gamification).toEqual({
      processingId: events[0]?.eventId,
      status: 'PENDING',
    })
    expect(result.session?.status).toBe(WorkoutSessionStatus.COMPLETED)
    expect(completions.items).toHaveLength(1)
    expect(completions.items[0]?.hasActivity).toBe(true)
  })

  it('should preserve activity from a previously completed exercise when only skipped exercises are submitted', async () => {
    exerciseSessions = [
      makeExerciseSession({ completed: true, logs: [makeExerciseLog()] }),
      makeExerciseSession({
        id: 'skipped-exercise',
        exerciseId: 'other-exercise',
      }),
    ]
    const request = {
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'skipped-exercise',
          sets: 3,
          reps: 10,
          completed: false,
        },
      ],
    }
    const result = await sut.execute(request)
    expect(result.session?.status).toBe(WorkoutSessionStatus.INCOMPLETE)
    expect(events[0]?.data).toMatchObject({
      status: 'INCOMPLETE',
      hasActivity: true,
    })
    expect(completions.items[0]?.hasActivity).toBe(true)
    expect(exerciseLogsRepository.create).not.toHaveBeenCalled()
    await sut.execute(request)
    expect(workoutSessionsRepository.update).toHaveBeenCalledTimes(1)
    expect(exerciseSessionsRepository.update).toHaveBeenCalledTimes(1)
  })

  it('returns the latest persisted processing state without rewriting completed execution', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-10T12:00:00Z'))
    workoutSession.date = new Date('2026-06-10T12:00:00Z')
    const request = {
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          completed: true,
        },
      ],
    }
    const original = await sut.execute(request)
    const processing = processings[0]
    if (!processing) {
      throw new Error('Test processing is missing.')
    }
    processing.status = 'COMPLETED'
    const before = structuredClone({
      workoutSession,
      exerciseSessions,
      completions: completions.items,
    })
    vi.setSystemTime(new Date('2026-06-12T12:00:00Z'))
    const result = await sut.execute({
      ...request,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          reps: 10,
          completed: false,
          sets: 99,
        },
      ],
    })
    expect(result.gamification).toEqual({
      processingId: original.gamification.processingId,
      status: 'COMPLETED',
    })
    expect({
      workoutSession,
      exerciseSessions,
      completions: completions.items,
    }).toEqual(before)
    expect(exerciseLogsRepository.create).toHaveBeenCalledTimes(1)
    expect(exerciseSessionsRepository.update).toHaveBeenCalledTimes(1)
    expect(workoutSessionsRepository.update).toHaveBeenCalledTimes(1)
    expect(events).toHaveLength(1)
  })

  it('should preserve timer measurements but record the actual completion instant for reward recovery', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-12T12:00:00Z'))
    workoutSession.date = new Date('2026-06-12T12:00:00Z')
    workoutSession.startedAt = new Date('2026-06-12T10:00:00Z')
    workoutSession.endedAt = new Date('2026-06-12T11:00:00Z')
    workoutSession.duration = 3600
    const request = {
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          completed: true,
        },
      ],
    }
    await sut.execute(request)
    vi.setSystemTime(new Date('2026-06-13T12:00:00Z'))
    await sut.execute(request)
    expect(workoutSession.endedAt).toEqual(new Date('2026-06-12T11:00:00Z'))
    expect(workoutSession.duration).toBe(3600)
    expect(completions.items[0]?.completedAt).toEqual(
      new Date('2026-06-12T12:00:00Z')
    )
    expect(events[0]?.data).toMatchObject({
      completedAt: '2026-06-12T12:00:00.000Z',
      businessDate: '2026-06-12',
      timezone: 'America/Sao_Paulo',
    })
  })

  it('rejects a recorded completion without a processing identity', async () => {
    workoutSession.status = WorkoutSessionStatus.COMPLETED
    await completions.create({
      sessionId,
      completedAt: new Date('2025-12-31T12:00:00Z'),
      hasActivity: true,
    })

    await expect(
      sut.execute({ userId, sessionId, exercises: [] })
    ).rejects.toMatchObject({
      statusCode: 409,
    })
    expect(workoutSessionsRepository.update).not.toHaveBeenCalled()
    expect(events).toHaveLength(0)
    expect(processings).toHaveLength(0)
  })

  it('should serialize concurrent completions without duplicate performance writes', async () => {
    const request = {
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          completed: true,
        },
      ],
    }
    const results = await Promise.all(
      Array.from({ length: 12 }, () => sut.execute(request))
    )
    expect(
      results.every(
        (result) => result.session?.status === WorkoutSessionStatus.COMPLETED
      )
    ).toBe(true)
    expect(exerciseLogsRepository.create).toHaveBeenCalledTimes(1)
    expect(workoutSessionsRepository.update).toHaveBeenCalledTimes(1)
    expect(completions.items).toHaveLength(1)
    expect(events).toHaveLength(1)
    expect(events[0]?.data).toEqual({
      sessionId,
      userId,
      status: 'COMPLETED',
      hasActivity: true,
      completedAt: '2026-01-01T12:00:00.000Z',
      businessDate: '2026-01-01',
      timezone: 'America/Sao_Paulo',
    })
    expect(processings).toEqual([
      { eventId: events[0]?.eventId, sessionId, userId, status: 'PENDING' },
    ])
  })

  it('rolls back completion and outbox when pending processing cannot be created', async () => {
    vi.mocked(createPending).mockRejectedValueOnce(
      new Error('Processing write failed')
    )
    const request = {
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          completed: true,
        },
      ],
    }

    await expect(sut.execute(request)).rejects.toThrow(
      'Processing write failed'
    )
    expect(workoutSession.status).toBe(WorkoutSessionStatus.IN_PROGRESS)
    expect(getFirstExerciseSession().completed).toBe(false)
    expect(logs).toHaveLength(0)
    expect(completions.items).toHaveLength(0)
    expect(events).toHaveLength(0)
    expect(processings).toHaveLength(0)

    await expect(sut.execute(request)).resolves.toMatchObject({
      gamification: { status: 'PENDING' },
    })
    expect(events).toHaveLength(1)
    expect(processings).toHaveLength(1)
  })

  it('rejects a retry from a different owner', async () => {
    const request = {
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          completed: true,
        },
      ],
    }
    await sut.execute(request)
    await expect(
      sut.execute({ ...request, userId: 'other' })
    ).rejects.toMatchObject({ statusCode: 404 })
  })

  it('should roll back execution when recording completion metadata fails', async () => {
    vi.spyOn(completions, 'create').mockRejectedValueOnce(
      new Error('Persistence failed.')
    )
    const before = structuredClone({ workoutSession, exerciseSessions })
    const request = {
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          completed: true,
        },
      ],
    }
    await expect(sut.execute(request)).rejects.toThrow('Persistence failed.')
    expect({ workoutSession, exerciseSessions }).toEqual(before)
    expect(completions.items).toHaveLength(0)
    expect((await sut.execute(request)).session?.status).toBe(
      WorkoutSessionStatus.COMPLETED
    )
  })
  it.each([
    '2025-12-31',
    '2026-01-02',
  ])('rejects execution for another business day %s without writing an event', async (businessDate) => {
    workoutSession.dailyIdentity = {
      businessDate,
      timezone: 'America/Sao_Paulo',
    }
    await expect(
      sut.execute({
        userId,
        sessionId,
        exercises: [
          {
            exerciseSessionId: 'exercise-session-id',
            sets: 3,
            reps: 10,
            completed: true,
          },
        ],
      })
    ).rejects.toMatchObject({ statusCode: 409 })
    expect(exerciseLogsRepository.create).not.toHaveBeenCalled()
    expect(workoutSessionsRepository.update).not.toHaveBeenCalled()
    expect(completions.items).toHaveLength(0)
  })

  it('accepts the last local instant and recovers after midnight with its persisted credit day', async () => {
    workoutSession.dailyIdentity = {
      businessDate: '2026-01-01',
      timezone: 'America/Sao_Paulo',
    }
    vi.setSystemTime(new Date('2026-01-02T02:59:59.999Z'))
    const request = {
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          completed: true,
        },
      ],
    }
    const original = await sut.execute(request)
    vi.setSystemTime(new Date('2026-01-03T12:00:00Z'))
    expect((await sut.execute(request)).gamification).toEqual(
      original.gamification
    )
    expect(exerciseLogsRepository.create).toHaveBeenCalledTimes(1)
    expect(events[0]?.data.businessDate).toBe('2026-01-01')
  })

  it('blocks an in-progress session at exactly local midnight', async () => {
    workoutSession.dailyIdentity = {
      businessDate: '2026-01-01',
      timezone: 'America/Sao_Paulo',
    }
    workoutSession.startedAt = new Date('2026-01-02T02:40:00Z')
    vi.setSystemTime(new Date('2026-01-02T03:00:00Z'))
    await expect(
      sut.execute({
        userId,
        sessionId,
        exercises: [
          {
            exerciseSessionId: 'exercise-session-id',
            sets: 3,
            reps: 10,
            completed: true,
          },
        ],
      })
    ).rejects.toMatchObject({ statusCode: 409 })
    expect(workoutSession.status).toBe(WorkoutSessionStatus.IN_PROGRESS)
    expect(completions.items).toHaveLength(0)
  })
  it('uses the captured identity rather than UTC or the session timestamp', async () => {
    workoutSession.dailyIdentity = {
      businessDate: '2026-01-02',
      timezone: 'Pacific/Kiritimati',
    }
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
    await sut.execute({
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          completed: true,
        },
      ],
    })
    expect(completions.items[0]).toMatchObject({
      businessDate: '2026-01-02',
      timezone: 'Pacific/Kiritimati',
    })
  })

  it('honors the last instant of a DST-shortened local day', async () => {
    workoutSession.dailyIdentity = {
      businessDate: '2026-03-08',
      timezone: 'America/New_York',
    }
    vi.setSystemTime(new Date('2026-03-09T03:59:59.999Z'))
    await sut.execute({
      userId,
      sessionId,
      exercises: [
        {
          exerciseSessionId: 'exercise-session-id',
          sets: 3,
          reps: 10,
          completed: true,
        },
      ],
    })
    expect(completions.items[0]?.businessDate).toBe('2026-03-08')
  })
})
