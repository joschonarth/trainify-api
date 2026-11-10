import { beforeEach, describe, expect, it, vi } from 'vitest'

import { InMemoryExercisesRepository } from '@/modules/exercise/repositories/in-memory/in-memory-exercises.repository'
import { InMemoryMyExercisesRepository } from '@/modules/exercise/repositories/in-memory/in-memory-my-exercises.repository'
import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { InMemoryWorkoutExercisesRepository } from '../repositories/in-memory/in-memory-workout-exercises.repository'
import { InMemoryWorkoutsRepository } from '../repositories/in-memory/in-memory-workouts.repository'
import { makeWorkoutExercise } from '../tests/factories/make-workout-exercise'
import { AddExerciseToWorkoutUseCase } from './add-exercise-to-workout.use-case'

const userId = 'user-id'
const workoutId = 'workout-id'

describe('AddExerciseToWorkoutUseCase', () => {
  let exercisesRepository: InMemoryExercisesRepository
  let myExercisesRepository: InMemoryMyExercisesRepository
  let workoutExercisesRepository: InMemoryWorkoutExercisesRepository
  let workoutsRepository: InMemoryWorkoutsRepository
  let sut: AddExerciseToWorkoutUseCase

  beforeEach(async () => {
    exercisesRepository = new InMemoryExercisesRepository()
    workoutExercisesRepository = new InMemoryWorkoutExercisesRepository(
      exercisesRepository
    )
    myExercisesRepository = new InMemoryMyExercisesRepository(
      exercisesRepository,
      workoutExercisesRepository
    )
    workoutsRepository = new InMemoryWorkoutsRepository(
      workoutExercisesRepository
    )
    await workoutsRepository.create({
      id: workoutId,
      name: 'Workout',
      user: { connect: { id: userId } },
    })

    sut = new AddExerciseToWorkoutUseCase(
      workoutExercisesRepository,
      workoutsRepository,
      exercisesRepository,
      myExercisesRepository
    )
  })

  it('adds an active exercise from the user library to the workout', async () => {
    const exercise = await exercisesRepository.create({
      name: 'Bench Press',
      isCustom: true,
      user: { connect: { id: userId } },
    })
    await myExercisesRepository.addExercise(userId, exercise.id)

    const { workoutExercise } = await sut.execute({
      userId,
      workoutId,
      exerciseId: exercise.id,
      defaultSets: 3,
      defaultReps: 10,
      defaultWeight: 20,
    })

    expect(workoutExercise.exerciseId).toBe(exercise.id)
    expect(workoutExercisesRepository.items).toHaveLength(1)
  })

  it('returns workout exercises sorted by position', async () => {
    const firstExercise = await exercisesRepository.create({
      name: 'Bench Press',
      isCustom: true,
      user: { connect: { id: userId } },
    })
    const secondExercise = await exercisesRepository.create({
      name: 'Squat',
      isCustom: true,
      user: { connect: { id: userId } },
    })
    await workoutExercisesRepository.addExerciseToWorkout({
      workout: { connect: { id: workoutId } },
      exercise: { connect: { id: firstExercise.id } },
      position: 2,
    })
    await workoutExercisesRepository.addExerciseToWorkout({
      workout: { connect: { id: workoutId } },
      exercise: { connect: { id: secondExercise.id } },
      position: 1,
    })

    await expect(
      workoutExercisesRepository.findByWorkout(workoutId)
    ).resolves.toMatchObject([
      { exerciseId: secondExercise.id, position: 1 },
      { exerciseId: firstExercise.id, position: 2 },
    ])
  })

  it('returns not found when the exercise is outside the user library', async () => {
    const exercise = await exercisesRepository.create({
      name: 'Bench Press',
      isCustom: true,
      user: { connect: { id: 'another-user-id' } },
    })
    const addExerciseToWorkout = vi.spyOn(
      workoutExercisesRepository,
      'addExerciseToWorkout'
    )

    await expect(
      sut.execute({
        userId,
        workoutId,
        exerciseId: exercise.id,
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 20,
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)

    expect(addExerciseToWorkout).not.toHaveBeenCalled()
    expect(workoutExercisesRepository.items).toHaveLength(0)
  })

  it('returns not found when the library exercise is archived', async () => {
    const exercise = await exercisesRepository.create({
      name: 'Bench Press',
      isCustom: true,
      archivedAt: new Date(),
      user: { connect: { id: userId } },
    })
    await myExercisesRepository.addExercise(userId, exercise.id)

    await expect(
      sut.execute({
        userId,
        workoutId,
        exerciseId: exercise.id,
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 20,
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)

    expect(workoutExercisesRepository.items).toHaveLength(0)
  })

  it('returns conflict when the exercise is already in the workout', async () => {
    const exercise = await exercisesRepository.create({
      name: 'Bench Press',
      isCustom: true,
      user: { connect: { id: userId } },
    })
    await myExercisesRepository.addExercise(userId, exercise.id)
    await makeWorkoutExercise(
      workoutExercisesRepository,
      workoutId,
      exercise.id
    )
    const addExerciseToWorkout = vi.spyOn(
      workoutExercisesRepository,
      'addExerciseToWorkout'
    )

    await expect(
      sut.execute({
        userId,
        workoutId,
        exerciseId: exercise.id,
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 20,
      })
    ).rejects.toBeInstanceOf(ResourceAlreadyExistsError)

    expect(addExerciseToWorkout).not.toHaveBeenCalled()
    expect(workoutExercisesRepository.items).toHaveLength(1)
  })
})
