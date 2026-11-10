import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryExercisesRepository } from '@/modules/exercise/repositories/in-memory/in-memory-exercises.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InvalidWorkoutExerciseOrderError } from '../errors/invalid-workout-exercise-order.error'
import { InMemoryWorkoutExercisesRepository } from '../repositories/in-memory/in-memory-workout-exercises.repository'
import { InMemoryWorkoutsRepository } from '../repositories/in-memory/in-memory-workouts.repository'
import { ReorderWorkoutExercisesUseCase } from './reorder-workout-exercises.use-case'

describe('ReorderWorkoutExercisesUseCase', () => {
  let workoutExercisesRepository: InMemoryWorkoutExercisesRepository
  let workoutsRepository: InMemoryWorkoutsRepository
  let exerciseIds: [string, string, string]
  let sut: ReorderWorkoutExercisesUseCase

  beforeEach(async () => {
    const exercisesRepository = new InMemoryExercisesRepository()
    workoutExercisesRepository = new InMemoryWorkoutExercisesRepository(
      exercisesRepository
    )
    workoutsRepository = new InMemoryWorkoutsRepository(
      workoutExercisesRepository
    )
    await workoutsRepository.create({
      id: 'workout-id',
      name: 'Workout',
      user: { connect: { id: 'user-id' } },
    })

    const firstExercise = await exercisesRepository.create({
      name: 'Bench Press',
      isCustom: false,
    })
    const secondExercise = await exercisesRepository.create({
      name: 'Squat',
      isCustom: false,
    })
    const thirdExercise = await exercisesRepository.create({
      name: 'Row',
      isCustom: false,
    })
    const exercises = [firstExercise, secondExercise, thirdExercise]
    exerciseIds = [firstExercise.id, secondExercise.id, thirdExercise.id]

    for (const [position, exercise] of exercises.entries()) {
      await workoutExercisesRepository.addExerciseToWorkout({
        workout: { connect: { id: 'workout-id' } },
        exercise: { connect: { id: exercise.id } },
        position,
      })
    }

    sut = new ReorderWorkoutExercisesUseCase(
      workoutsRepository,
      workoutExercisesRepository
    )
  })

  it('updates and returns the complete workout exercise order', async () => {
    const reorderedIds = [exerciseIds[2], exerciseIds[0], exerciseIds[1]]

    const result = await sut.execute({
      userId: 'user-id',
      workoutId: 'workout-id',
      exerciseIds: reorderedIds,
    })

    expect(
      result.exercises.map(({ exerciseId, position }) => ({
        exerciseId,
        position,
      }))
    ).toEqual([
      { exerciseId: exerciseIds[2], position: 0 },
      { exerciseId: exerciseIds[0], position: 1 },
      { exerciseId: exerciseIds[1], position: 2 },
    ])
  })

  it('rejects an order that omits an exercise', async () => {
    await expect(
      sut.execute({
        userId: 'user-id',
        workoutId: 'workout-id',
        exerciseIds: exerciseIds.slice(0, 2),
      })
    ).rejects.toBeInstanceOf(InvalidWorkoutExerciseOrderError)
  })

  it('rejects duplicate exercise IDs', async () => {
    await expect(
      sut.execute({
        userId: 'user-id',
        workoutId: 'workout-id',
        exerciseIds: [exerciseIds[0], exerciseIds[0], exerciseIds[2]],
      })
    ).rejects.toBeInstanceOf(InvalidWorkoutExerciseOrderError)
  })

  it('rejects exercises not associated with the workout', async () => {
    await expect(
      sut.execute({
        userId: 'user-id',
        workoutId: 'workout-id',
        exerciseIds: [exerciseIds[0], exerciseIds[1], 'not-in-workout'],
      })
    ).rejects.toBeInstanceOf(InvalidWorkoutExerciseOrderError)
  })

  it('does not allow reordering another user workout', async () => {
    await expect(
      sut.execute({
        userId: 'another-user-id',
        workoutId: 'workout-id',
        exerciseIds,
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
