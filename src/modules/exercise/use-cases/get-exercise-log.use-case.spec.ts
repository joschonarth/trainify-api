import { beforeEach, describe, expect, it } from 'vitest'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryExerciseLogsRepository } from '../repositories/in-memory/in-memory-exercise-logs.repository'
import { InMemoryExercisesRepository } from '../repositories/in-memory/in-memory-exercises.repository'
import { makeExercise } from '../tests/factories/make-exercise'
import { GetExerciseLogUseCase } from './get-exercise-log.use-case'

describe('GetExerciseLogUseCase', () => {
  let exercises: InMemoryExercisesRepository
  let logs: InMemoryExerciseLogsRepository
  let sut: GetExerciseLogUseCase
  beforeEach(() => {
    exercises = new InMemoryExercisesRepository()
    logs = new InMemoryExerciseLogsRepository(exercises)
    sut = new GetExerciseLogUseCase(logs)
  })
  it.each([
    ['DURATION', 0],
    ['REPS', 3600],
  ] as const)('should expose correct %s volume without rewriting legacy history', async (measurement, expected) => {
    const exercise = await makeExercise(exercises, { measurement })
    const log = await logs.create({
      sets: 2,
      reps: 30,
      weight: 60,
      volume: 3600,
      user: { connect: { id: 'user' } },
      exercise: { connect: { id: exercise.id } },
      exerciseSession: { connect: { id: 'exercise-session' } },
    })
    const result = await sut.execute({ logId: log.id, userId: 'user' })
    expect(result.log.volume).toBe(expected)
    expect(result.log.reps).toBe(30)
    expect(logs.items[0]?.volume).toBe(3600)
  })
  it('should reject missing logs', async () => {
    await expect(
      sut.execute({ logId: 'missing', userId: 'user' })
    ).rejects.toBeInstanceOf(
      ResourceNotFoundError
    )
  })

  it('should reject logs owned by another user', async () => {
    const exercise = await makeExercise(exercises)
    const log = await logs.create({
      sets: 3,
      reps: 10,
      weight: 20,
      volume: 600,
      user: { connect: { id: 'owner' } },
      exercise: { connect: { id: exercise.id } },
      exerciseSession: { connect: { id: 'exercise-session' } },
    })

    await expect(
      sut.execute({ logId: log.id, userId: 'another-user' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
