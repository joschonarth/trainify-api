import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryExercisesRepository } from '@/modules/exercise/repositories/in-memory/in-memory-exercises.repository'
import { InMemoryWorkoutExercisesRepository } from '../repositories/in-memory/in-memory-workout-exercises.repository'
import { InMemoryWorkoutsRepository } from '../repositories/in-memory/in-memory-workouts.repository'
import { RemoveExerciseFromWorkoutUseCase } from './remove-exercise-from-workout.use-case'

describe('RemoveExerciseFromWorkoutUseCase', () => {
  let exercises: InMemoryExercisesRepository
  let workoutExercises: InMemoryWorkoutExercisesRepository
  let workouts: InMemoryWorkoutsRepository
  let sut: RemoveExerciseFromWorkoutUseCase
  let exerciseIds: string[]

  beforeEach(async () => {
    exercises = new InMemoryExercisesRepository()
    workoutExercises = new InMemoryWorkoutExercisesRepository(exercises)
    workouts = new InMemoryWorkoutsRepository(workoutExercises)
    await workouts.create({
      id: 'workout-1',
      name: 'Strength',
      user: { connect: { id: 'user-1' } },
    })
    exerciseIds = []
    for (const [position, name] of ['A', 'B', 'C'].entries()) {
      const exercise = await exercises.create({ name, isCustom: false })
      exerciseIds.push(exercise.id)
      await workoutExercises.addExerciseToWorkout({
        workout: { connect: { id: 'workout-1' } },
        exercise: { connect: { id: exercise.id } },
        position,
      })
    }
    sut = new RemoveExerciseFromWorkoutUseCase(workouts, workoutExercises)
  })

  it('renumbers remaining exercises after removing one', async () => {
    const removedExerciseId = exerciseIds[1]
    if (!removedExerciseId) {
      throw new Error('Expected exercise fixture to exist.')
    }
    await sut.execute({
      userId: 'user-1',
      workoutId: 'workout-1',
      exerciseId: removedExerciseId,
    })
    const remaining = await workoutExercises.findByWorkout('workout-1')
    expect(
      remaining.map(({ exerciseId, position }) => ({ exerciseId, position }))
    ).toEqual([
      { exerciseId: exerciseIds[0], position: 0 },
      { exerciseId: exerciseIds[2], position: 1 },
    ])
  })
})
