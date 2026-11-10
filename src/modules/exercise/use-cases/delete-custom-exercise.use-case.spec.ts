import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryWorkoutExercisesRepository } from '@/modules/workout/repositories/in-memory/in-memory-workout-exercises.repository'
import { InMemoryWorkoutsRepository } from '@/modules/workout/repositories/in-memory/in-memory-workouts.repository'

import { InMemoryExerciseLogsRepository } from '../repositories/in-memory/in-memory-exercise-logs.repository'
import { InMemoryExercisesRepository } from '../repositories/in-memory/in-memory-exercises.repository'
import { InMemoryMyExercisesRepository } from '../repositories/in-memory/in-memory-my-exercises.repository'
import { DeleteCustomExerciseUseCase } from './delete-custom-exercise.use-case'

const userId = 'user-id'

describe('DeleteCustomExerciseUseCase', () => {
  let exercisesRepository: InMemoryExercisesRepository
  let myExercisesRepository: InMemoryMyExercisesRepository
  let exerciseLogsRepository: InMemoryExerciseLogsRepository
  let workoutExercisesRepository: InMemoryWorkoutExercisesRepository
  let workoutsRepository: InMemoryWorkoutsRepository
  let sut: DeleteCustomExerciseUseCase

  beforeEach(() => {
    exercisesRepository = new InMemoryExercisesRepository()
    workoutExercisesRepository = new InMemoryWorkoutExercisesRepository(
      exercisesRepository
    )
    workoutsRepository = new InMemoryWorkoutsRepository(
      workoutExercisesRepository
    )
    myExercisesRepository = new InMemoryMyExercisesRepository(
      exercisesRepository,
      workoutExercisesRepository
    )
    exerciseLogsRepository = new InMemoryExerciseLogsRepository(
      exercisesRepository
    )
    sut = new DeleteCustomExerciseUseCase(
      exercisesRepository,
      myExercisesRepository
    )
  })

  it('archives the custom exercise, removes its library entry and preserves its history', async () => {
    const exercise = await exercisesRepository.create({
      name: 'Bench Press',
      isCustom: true,
      user: { connect: { id: userId } },
    })
    await myExercisesRepository.addExercise(userId, exercise.id)
    await myExercisesRepository.addExercise('another-user-id', exercise.id)
    await workoutsRepository.create({
      id: 'workout-id',
      name: 'Strength Workout',
      user: { connect: { id: userId } },
    })
    await workoutExercisesRepository.addExerciseToWorkout({
      workout: { connect: { id: 'workout-id' } },
      exercise: { connect: { id: exercise.id } },
      defaultSets: 3,
      defaultReps: 10,
      defaultWeight: null,
    })
    const otherExercise = await exercisesRepository.create({
      name: 'Squat',
      isCustom: true,
      user: { connect: { id: userId } },
    })
    await workoutExercisesRepository.addExerciseToWorkout({
      workout: { connect: { id: 'workout-id' } },
      exercise: { connect: { id: otherExercise.id } },
      defaultSets: 3,
      defaultReps: 10,
      defaultWeight: null,
    })
    await exerciseLogsRepository.create({
      sets: 3,
      reps: 10,
      user: { connect: { id: userId } },
      exercise: { connect: { id: exercise.id } },
      exerciseSession: { connect: { id: 'exercise-session-id' } },
    })

    await expect(
      sut.execute({ userId, exerciseId: exercise.id })
    ).resolves.toBeUndefined()

    const archivedExercise = await exercisesRepository.findById(
      exercise.id,
      true
    )
    const visibleExercise = await exercisesRepository.findById(exercise.id)
    const libraryEntry = await myExercisesRepository.findByUserAndExercise(
      userId,
      exercise.id
    )

    expect(archivedExercise?.archivedAt).toBeInstanceOf(Date)
    expect(visibleExercise).toBeNull()
    expect(libraryEntry).toBeNull()
    expect(
      await myExercisesRepository.findByUserAndExercise(
        'another-user-id',
        exercise.id
      )
    ).not.toBeNull()
    await expect(
      myExercisesRepository.findAllByUser('another-user-id', '', null, 1, 20)
    ).resolves.toEqual({ items: [], total: 0 })
    expect(exerciseLogsRepository.items).toHaveLength(1)
    expect(exerciseLogsRepository.items[0]?.exerciseId).toBe(exercise.id)
    await expect(
      exerciseLogsRepository.findAllByUser(userId)
    ).resolves.toMatchObject([
      {
        exercise: { id: exercise.id, name: 'Bench Press' },
      },
    ])
    expect(workoutExercisesRepository.items).toHaveLength(1)
    expect(workoutExercisesRepository.items[0]?.exerciseId).toBe(
      otherExercise.id
    )
    await expect(
      workoutExercisesRepository.findByWorkout('workout-id')
    ).resolves.toMatchObject([
      { exercise: { id: otherExercise.id, name: 'Squat' } },
    ])
    await expect(
      workoutsRepository.findById('workout-id')
    ).resolves.toMatchObject({ id: 'workout-id', name: 'Strength Workout' })
  })

  it('hides archived exercises from catalog and user listings', async () => {
    await exercisesRepository.create({
      name: 'Archived Catalog Exercise',
      isCustom: false,
      archivedAt: new Date(),
    })
    await exercisesRepository.create({
      name: 'Archived Custom Exercise',
      isCustom: true,
      archivedAt: new Date(),
      user: { connect: { id: userId } },
    })

    await expect(
      exercisesRepository.findAllGlobals('', null, 1)
    ).resolves.toEqual([])
    await expect(exercisesRepository.findManyByUser(userId)).resolves.toEqual(
      []
    )
  })
})
