import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryWorkoutExercisesRepository } from '@/modules/workout/repositories/in-memory/in-memory-workout-exercises.repository'

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
  let sut: DeleteCustomExerciseUseCase

  beforeEach(() => {
    exercisesRepository = new InMemoryExercisesRepository()
    myExercisesRepository = new InMemoryMyExercisesRepository(
      exercisesRepository
    )
    exerciseLogsRepository = new InMemoryExerciseLogsRepository(
      exercisesRepository
    )
    workoutExercisesRepository = new InMemoryWorkoutExercisesRepository(
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
    await workoutExercisesRepository.addExerciseToWorkout({
      workout: { connect: { id: 'workout-id' } },
      exercise: { connect: { id: exercise.id } },
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

    const archivedExercise = await exercisesRepository.findById(exercise.id)
    const libraryEntry = await myExercisesRepository.findByUserAndExercise(
      userId,
      exercise.id
    )

    expect(archivedExercise?.archivedAt).toBeInstanceOf(Date)
    expect(libraryEntry).toBeNull()
    expect(
      await myExercisesRepository.findByUserAndExercise(
        'another-user-id',
        exercise.id
      )
    ).not.toBeNull()
    expect(exerciseLogsRepository.items).toHaveLength(1)
    expect(exerciseLogsRepository.items[0]?.exerciseId).toBe(exercise.id)
    expect(workoutExercisesRepository.items).toHaveLength(1)
    expect(workoutExercisesRepository.items[0]?.exerciseId).toBe(exercise.id)
  })
})
