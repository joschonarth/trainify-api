import { beforeEach, describe, expect, it } from 'vitest'

import { InMemoryWorkoutExercisesRepository } from '@/modules/workout/repositories/in-memory/in-memory-workout-exercises.repository'
import { InMemoryWorkoutsRepository } from '@/modules/workout/repositories/in-memory/in-memory-workouts.repository'

import { InMemoryExercisesRepository } from '../repositories/in-memory/in-memory-exercises.repository'
import { InMemoryMyExercisesRepository } from '../repositories/in-memory/in-memory-my-exercises.repository'
import { DeleteCustomExerciseUseCase } from './delete-custom-exercise.use-case'
import { RemoveCatalogExerciseUseCase } from './remove-catalog-exercise.use-case'
import { RemoveExerciseFromLibraryUseCase } from './remove-exercise-from-library.use-case'

describe('RemoveExerciseFromLibraryUseCase', () => {
  let exercisesRepository: InMemoryExercisesRepository
  let myExercisesRepository: InMemoryMyExercisesRepository
  let workoutExercisesRepository: InMemoryWorkoutExercisesRepository
  let workoutsRepository: InMemoryWorkoutsRepository
  let sut: RemoveExerciseFromLibraryUseCase

  beforeEach(() => {
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
    sut = new RemoveExerciseFromLibraryUseCase(
      exercisesRepository,
      new DeleteCustomExerciseUseCase(
        exercisesRepository,
        myExercisesRepository
      ),
      new RemoveCatalogExerciseUseCase(
        myExercisesRepository,
        workoutsRepository
      )
    )
  })

  it('archives a custom exercise owned by the user', async () => {
    const userId = 'user-id'
    const exercise = await exercisesRepository.create({
      name: 'Custom exercise',
      isCustom: true,
      user: { connect: { id: userId } },
    })
    await myExercisesRepository.addExercise(userId, exercise.id)

    await sut.execute({ userId, exerciseId: exercise.id })

    await expect(
      exercisesRepository.findById(exercise.id, true)
    ).resolves.toMatchObject({ archivedAt: expect.any(Date) })
    await expect(
      myExercisesRepository.findByUserAndExercise(userId, exercise.id)
    ).resolves.toBeNull()
  })

  it('removes a catalog exercise from the user library', async () => {
    const userId = 'user-id'
    const exercise = await exercisesRepository.create({
      name: 'Catalog exercise',
      isCustom: false,
    })
    await myExercisesRepository.addExercise(userId, exercise.id)

    await sut.execute({ userId, exerciseId: exercise.id })

    await expect(
      myExercisesRepository.findByUserAndExercise(userId, exercise.id)
    ).resolves.toBeNull()
    await expect(exercisesRepository.findById(exercise.id)).resolves.toEqual(
      exercise
    )
  })
})
