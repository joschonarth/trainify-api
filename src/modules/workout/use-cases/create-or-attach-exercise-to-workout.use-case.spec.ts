import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryExercisesRepository } from '@/modules/exercise/repositories/in-memory/in-memory-exercises.repository'
import { InMemoryMyExercisesRepository } from '@/modules/exercise/repositories/in-memory/in-memory-my-exercises.repository'
import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InMemoryWorkoutExercisesRepository } from '../repositories/in-memory/in-memory-workout-exercises.repository'
import { InMemoryWorkoutsRepository } from '../repositories/in-memory/in-memory-workouts.repository'
import { CreateOrAttachExerciseToWorkoutUseCase } from './create-or-attach-exercise-to-workout.use-case'

const userId = 'user-id'
const workoutId = 'workout-id'

describe('CreateOrAttachExerciseToWorkoutUseCase', () => {
  let exercisesRepository: InMemoryExercisesRepository
  let myExercisesRepository: InMemoryMyExercisesRepository
  let workoutExercisesRepository: InMemoryWorkoutExercisesRepository
  let workoutsRepository: InMemoryWorkoutsRepository
  let sut: CreateOrAttachExerciseToWorkoutUseCase

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

    sut = new CreateOrAttachExerciseToWorkoutUseCase(
      exercisesRepository,
      myExercisesRepository,
      workoutsRepository,
      workoutExercisesRepository
    )
  })

  it('returns a conflict when the exercise is already attached to the workout', async () => {
    const request = {
      userId,
      workoutId,
      name: 'Bench Press',
      category: 'CHEST' as const,
      type: 'STRENGTH' as const,
      defaultSets: 3,
      defaultReps: 10,
      defaultWeight: 20,
    }

    await sut.execute(request)
    const addExerciseToWorkout = vi.spyOn(
      workoutExercisesRepository,
      'addExerciseToWorkout'
    )

    await expect(sut.execute(request)).rejects.toBeInstanceOf(
      ResourceAlreadyExistsError
    )

    expect(addExerciseToWorkout).not.toHaveBeenCalled()
    expect(workoutExercisesRepository.items).toHaveLength(1)
  })

  it('adds newly created custom exercises to the user library', async () => {
    const result = await sut.execute({
      userId,
      workoutId,
      name: 'Bench Press',
      category: 'CHEST',
      type: 'STRENGTH',
      defaultSets: 3,
      defaultReps: 10,
      defaultWeight: 20,
    })

    const libraryEntry = await myExercisesRepository.findByUserAndExercise(
      userId,
      result.exercise.id
    )

    expect(libraryEntry).not.toBeNull()
  })

  it('assigns the next sequential position to newly attached exercises', async () => {
    const first = await sut.execute({
      userId,
      workoutId,
      name: 'Bench Press',
      category: 'CHEST',
      type: 'STRENGTH',
      defaultSets: 3,
      defaultReps: 10,
      defaultWeight: 20,
    })
    const second = await sut.execute({
      userId,
      workoutId,
      name: 'Squat',
      category: 'LEGS',
      type: 'STRENGTH',
      defaultSets: 3,
      defaultReps: 10,
      defaultWeight: 20,
    })

    expect([
      first.workoutExercise.position,
      second.workoutExercise.position,
    ]).toEqual([0, 1])
  })

  it('returns not found when an existing custom exercise is outside the library', async () => {
    const exercise = await exercisesRepository.create({
      name: 'Bench Press',
      category: 'CHEST',
      type: 'STRENGTH',
      isCustom: true,
      user: { connect: { id: userId } },
    })

    await expect(
      sut.execute({
        userId,
        workoutId,
        name: exercise.name,
        category: exercise.category,
        type: exercise.type,
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 20,
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)

    const libraryEntry = await myExercisesRepository.findByUserAndExercise(
      userId,
      exercise.id
    )

    expect(libraryEntry).toBeNull()
    expect(workoutExercisesRepository.items).toHaveLength(0)
  })

  it('returns not found for an archived custom exercise', async () => {
    const exercise = await exercisesRepository.create({
      name: 'Bench Press',
      category: 'CHEST',
      type: 'STRENGTH',
      isCustom: true,
      archivedAt: new Date(),
      user: { connect: { id: userId } },
    })

    await expect(
      sut.execute({
        userId,
        workoutId,
        name: exercise.name,
        category: exercise.category,
        type: exercise.type,
        defaultSets: 3,
        defaultReps: 10,
        defaultWeight: 20,
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)

    expect(workoutExercisesRepository.items).toHaveLength(0)
  })
})
