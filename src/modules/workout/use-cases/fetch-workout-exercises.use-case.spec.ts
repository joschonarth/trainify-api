import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExercisesRepository } from '@/modules/exercise/repositories/in-memory/in-memory-exercises.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryWorkoutExercisesRepository } from '../repositories/in-memory/in-memory-workout-exercises.repository'
import { InMemoryWorkoutsRepository } from '../repositories/in-memory/in-memory-workouts.repository'
import { FetchWorkoutExercisesUseCase } from './fetch-workout-exercises.use-case'

describe('FetchWorkoutExercisesUseCase', () => {
  let workouts: InMemoryWorkoutsRepository
  let workoutExercises: InMemoryWorkoutExercisesRepository
  let sut: FetchWorkoutExercisesUseCase

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
    await workoutExercises.addExerciseToWorkout({
      workout: { connect: { id: 'workout-1' } },
      exercise: { connect: { id: exercise.id } },
      position: 0,
    })
    sut = new FetchWorkoutExercisesUseCase(workouts, workoutExercises)
  })

  it('returns the exercises ordered for an owned workout', async () => {
    const result = await sut.execute({
      workoutId: 'workout-1',
      userId: 'user-1',
    })
    expect(result.exercises).toHaveLength(1)
    expect(result.exercises[0]?.exercise.name).toBe('Squat')
  })

  it('hides workouts that do not belong to the user', async () => {
    await expect(
      sut.execute({ workoutId: 'workout-1', userId: 'other-user' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
