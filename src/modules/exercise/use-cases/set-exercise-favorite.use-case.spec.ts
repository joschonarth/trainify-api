import { describe, expect, it } from 'vitest'
import { InMemoryWorkoutExercisesRepository } from '@/modules/workout/repositories/in-memory/in-memory-workout-exercises.repository'
import { InMemoryExercisesRepository } from '../repositories/in-memory/in-memory-exercises.repository'
import { InMemoryMyExercisesRepository } from '../repositories/in-memory/in-memory-my-exercises.repository'
import { fetchMyExercisesQuerySchema } from '../schemas/fetch-my-exercises.schema'
import { setExerciseFavoriteBodySchema } from '../schemas/set-exercise-favorite.schema'
import { SetExerciseFavoriteUseCase } from './set-exercise-favorite.use-case'

describe('Exercise favorites', () => {
  it('isolates users, filters false, assigns idempotently and resets after removal', async () => {
    const exercises = new InMemoryExercisesRepository()
    const library = new InMemoryMyExercisesRepository(
      exercises,
      new InMemoryWorkoutExercisesRepository(exercises)
    )
    const exercise = await exercises.create({ name: 'Bench', isCustom: false })
    const a = await library.addExercise('a', exercise.id)
    await library.addExercise('b', exercise.id)
    const sut = new SetExerciseFavoriteUseCase(library)
    for (let i = 0; i < 2; i++) {
      expect(
        await sut.execute({
          userId: 'a',
          exerciseId: exercise.id,
          isFavorite: true,
        })
      ).toEqual({ exerciseId: exercise.id, isFavorite: true })
    }
    expect(
      (await library.findByUserAndExercise('b', exercise.id))?.isFavorite
    ).toBe(false)
    expect(
      (await library.findAllByUser('a', '', null, 1, 20, null, false)).total
    ).toBe(0)
    expect(
      (await library.findAllByUser('a', '', null, 1, 20, null, true)).total
    ).toBe(1)
    await library.deleteById(a.id)
    await expect(
      sut.execute({ userId: 'a', exerciseId: exercise.id, isFavorite: true })
    ).rejects.toMatchObject({ statusCode: 404 })
    expect((await library.addExercise('a', exercise.id)).isFavorite).toBe(false)
    await exercises.archive(exercise.id)
    expect(await library.setFavorite('a', exercise.id, true)).toBeNull()
  })
  it('parses false explicitly and rejects invalid inputs', () => {
    expect(
      fetchMyExercisesQuerySchema.parse({ isFavorite: 'false' }).isFavorite
    ).toBe(false)
    expect(
      fetchMyExercisesQuerySchema.safeParse({ isFavorite: '1' }).success
    ).toBe(false)
    expect(
      setExerciseFavoriteBodySchema.safeParse({ isFavorite: 'false' }).success
    ).toBe(false)
    expect(
      setExerciseFavoriteBodySchema.safeParse({ isFavorite: true, userId: 'x' })
        .success
    ).toBe(false)
  })
})
