import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExercisesRepository } from '@/modules/exercise/repositories/in-memory/in-memory-exercises.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryWorkoutExercisesRepository } from '../repositories/in-memory/in-memory-workout-exercises.repository'
import { InMemoryWorkoutsRepository } from '../repositories/in-memory/in-memory-workouts.repository'
import { UpdateWorkoutExerciseDefaultsUseCase } from './update-workout-exercise-defaults.use-case'

describe('UpdateWorkoutExerciseDefaultsUseCase', () => {
  let workouts: InMemoryWorkoutsRepository
  let workoutExercises: InMemoryWorkoutExercisesRepository
  let sut: UpdateWorkoutExerciseDefaultsUseCase
  let exerciseId: string

  beforeEach(async () => {
    const exercises = new InMemoryExercisesRepository()
    workoutExercises = new InMemoryWorkoutExercisesRepository(exercises)
    workouts = new InMemoryWorkoutsRepository(workoutExercises)
    await workouts.create({
      id: 'workout-1',
      name: 'Strength',
      user: { connect: { id: 'user-1' } },
    })
    const exercise = await exercises.create({ name: 'Squat', isCustom: false })
    exerciseId = exercise.id
    await workoutExercises.addExerciseToWorkout({
      workout: { connect: { id: 'workout-1' } },
      exercise: { connect: { id: exerciseId } },
      defaultSets: 3,
      defaultReps: 8,
      defaultWeight: 40,
    })
    sut = new UpdateWorkoutExerciseDefaultsUseCase(workouts, workoutExercises)
  })

  it('updates defaults and permits clearing optional values', async () => {
    const result = await sut.execute({
      userId: 'user-1',
      workoutId: 'workout-1',
      exerciseId,
      defaultSets: 4,
      defaultReps: null,
      defaultWeight: null,
    })
    expect(result.workoutExercise).toMatchObject({
      defaultSets: 4,
      defaultReps: null,
      defaultWeight: null,
    })
  })

  it('hides workouts that do not belong to the user', async () => {
    await expect(
      sut.execute({
        userId: 'other-user',
        workoutId: 'workout-1',
        exerciseId,
        defaultSets: 3,
        defaultReps: 8,
        defaultWeight: 40,
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('returns not found when the exercise is not attached to the workout', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
        workoutId: 'workout-1',
        exerciseId: 'missing-exercise',
        defaultSets: 3,
        defaultReps: 8,
        defaultWeight: 40,
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
