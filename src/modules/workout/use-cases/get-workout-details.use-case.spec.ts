import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExercisesRepository } from '@/modules/exercise/repositories/in-memory/in-memory-exercises.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryWorkoutExercisesRepository } from '../repositories/in-memory/in-memory-workout-exercises.repository'
import { InMemoryWorkoutsRepository } from '../repositories/in-memory/in-memory-workouts.repository'
import { GetWorkoutDetailsUseCase } from './get-workout-details.use-case'

describe('GetWorkoutDetailsUseCase', () => {
  let workouts: InMemoryWorkoutsRepository
  let sut: GetWorkoutDetailsUseCase

  beforeEach(async () => {
    const exercises = new InMemoryExercisesRepository()
    const workoutExercises = new InMemoryWorkoutExercisesRepository(exercises)
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
    sut = new GetWorkoutDetailsUseCase(workouts)
  })

  it('returns workout details with its exercises', async () => {
    const result = await sut.execute({
      workoutId: 'workout-1',
      userId: 'user-1',
    })
    expect(result.workout).toMatchObject({
      id: 'workout-1',
      exercises: [{ exercise: { name: 'Squat' } }],
    })
  })

  it('keeps archived workout details available to its owner for history', async () => {
    await workouts.archive('workout-1')
    const result = await sut.execute({
      workoutId: 'workout-1',
      userId: 'user-1',
    })
    expect(result.workout.archivedAt).toBeInstanceOf(Date)
  })

  it('hides workouts that do not belong to the user', async () => {
    await expect(
      sut.execute({ workoutId: 'workout-1', userId: 'other-user' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
