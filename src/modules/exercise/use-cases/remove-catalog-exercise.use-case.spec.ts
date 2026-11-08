import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryWorkoutExercisesRepository } from '@/modules/workout/repositories/in-memory/in-memory-workout-exercises.repository'
import { InMemoryWorkoutsRepository } from '@/modules/workout/repositories/in-memory/in-memory-workouts.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { ExerciseUsedInWorkoutsError } from '../errors/exercise-used-in-workouts.error'
import { InMemoryExercisesRepository } from '../repositories/in-memory/in-memory-exercises.repository'
import { InMemoryMyExercisesRepository } from '../repositories/in-memory/in-memory-my-exercises.repository'
import { RemoveCatalogExerciseUseCase } from './remove-catalog-exercise.use-case'

describe('RemoveCatalogExerciseUseCase', () => {
  let myExercisesRepository: InMemoryMyExercisesRepository
  let workoutExercisesRepository: InMemoryWorkoutExercisesRepository
  let workoutsRepository: InMemoryWorkoutsRepository
  let sut: RemoveCatalogExerciseUseCase

  beforeEach(() => {
    const exercisesRepository = new InMemoryExercisesRepository()
    myExercisesRepository = new InMemoryMyExercisesRepository(
      exercisesRepository
    )
    workoutExercisesRepository = new InMemoryWorkoutExercisesRepository(
      exercisesRepository
    )
    workoutsRepository = new InMemoryWorkoutsRepository(
      workoutExercisesRepository
    )
    sut = new RemoveCatalogExerciseUseCase(
      myExercisesRepository,
      workoutsRepository
    )
  })

  it('removes a library entry by exercise ID for the owner', async () => {
    const entry = await myExercisesRepository.addExercise(
      'user-id',
      'exercise-id'
    )

    await sut.execute({ userId: 'user-id', exerciseId: 'exercise-id' })

    expect(await myExercisesRepository.findById(entry.id)).toBeNull()
  })

  it('does not remove another user library entry with the same exercise ID', async () => {
    const entry = await myExercisesRepository.addExercise(
      'other-user-id',
      'exercise-id'
    )

    await expect(
      sut.execute({ userId: 'user-id', exerciseId: 'exercise-id' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)

    expect(await myExercisesRepository.findById(entry.id)).not.toBeNull()
  })

  it('returns a conflict with affected workouts and preserves the library entry', async () => {
    const userId = 'user-id'
    const exerciseId = 'exercise-id'
    const entry = await myExercisesRepository.addExercise(userId, exerciseId)

    await workoutsRepository.create({
      id: 'workout-b',
      name: 'Evening Workout',
      user: { connect: { id: userId } },
    })
    await workoutsRepository.create({
      id: 'workout-a',
      name: 'Morning Workout',
      user: { connect: { id: userId } },
    })
    await workoutsRepository.create({
      id: 'other-user-workout',
      name: 'Other User Workout',
      user: { connect: { id: 'other-user-id' } },
    })
    await workoutExercisesRepository.addExerciseToWorkout({
      workout: { connect: { id: 'workout-b' } },
      exercise: { connect: { id: exerciseId } },
    })
    await workoutExercisesRepository.addExerciseToWorkout({
      workout: { connect: { id: 'workout-a' } },
      exercise: { connect: { id: exerciseId } },
    })
    await workoutExercisesRepository.addExerciseToWorkout({
      workout: { connect: { id: 'other-user-workout' } },
      exercise: { connect: { id: exerciseId } },
    })

    const execution = sut.execute({ userId, exerciseId })

    await expect(execution).rejects.toBeInstanceOf(ExerciseUsedInWorkoutsError)
    await expect(execution).rejects.toMatchObject({
      statusCode: 409,
      details: {
        workouts: [
          { id: 'workout-b', name: 'Evening Workout' },
          { id: 'workout-a', name: 'Morning Workout' },
        ],
      },
    })
    expect(await myExercisesRepository.findById(entry.id)).not.toBeNull()
  })
})
