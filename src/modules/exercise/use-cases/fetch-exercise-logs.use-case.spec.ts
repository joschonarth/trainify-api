import { describe, expect, it } from 'vitest'
import { makeWorkoutHistoryLog } from '@/modules/session/tests/factories/make-workout-history-session'
import { InMemoryExerciseLogsRepository } from '../repositories/in-memory/in-memory-exercise-logs.repository'
import { InMemoryExercisesRepository } from '../repositories/in-memory/in-memory-exercises.repository'
import { makeExercise } from '../tests/factories/make-exercise'
import { FetchExerciseLogsUseCase } from './fetch-exercise-logs.use-case'

describe('FetchExerciseLogsUseCase ordering', () => {
  it('returns newest execution first with stable ties regardless of insertion order', async () => {
    const exercises = new InMemoryExercisesRepository()
    await makeExercise(exercises, { id: 'exercise' })
    const logs = new InMemoryExerciseLogsRepository(exercises)
    logs.items.push(
      makeWorkoutHistoryLog({ id: 'a' }),
      makeWorkoutHistoryLog({ id: 'old', date: new Date(0) }),
      makeWorkoutHistoryLog({ id: 'z' }),
      makeWorkoutHistoryLog({ id: 'foreign', userId: 'other' })
    )
    const sut = new FetchExerciseLogsUseCase(logs)
    expect((await sut.execute('user')).logs.map((log) => log.logId)).toEqual([
      'z',
      'a',
      'old',
    ])
    expect(
      (await logs.findManyByExerciseAndUser('user', 'exercise')).map(
        (log) => log.id
      )
    ).toEqual(['old', 'a', 'z'])
  })
})
