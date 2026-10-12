import { beforeEach, describe, expect, it, vi } from 'vitest'

import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'
import type { WorkoutsRepository } from '@/modules/workout/repositories/workouts.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { FetchUserSchedulesUseCase } from './fetch-user-schedules.use-case'

let usersRepository: InMemoryUsersRepository
let workoutsRepository: WorkoutsRepository
let sut: FetchUserSchedulesUseCase

describe('Fetch User Schedules Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    workoutsRepository = {
      findAllByUser: vi.fn().mockResolvedValue([
        {
          id: 'workout-1',
          name: 'Push day',
          description: null,
          createdAt: new Date(),
          userId: 'user-1',
          exercises: [
            {
              id: 'workout-exercise-1',
              exerciseId: 'exercise-1',
              defaultSets: 3,
              defaultReps: 10,
              defaultWeight: 25,
              exercise: {
                id: 'exercise-1',
                name: 'Bench press',
                category: 'chest',
                type: 'weight',
              },
            },
          ],
          schedules: [{ id: 'schedule-1', dayOfWeek: 1 }],
        },
      ]),
    } as unknown as WorkoutsRepository
    sut = new FetchUserSchedulesUseCase(usersRepository, workoutsRepository)
  })

  it('should return the user workout schedules with exercise details', async () => {
    const user = await makeUser(usersRepository)

    const { schedules } = await sut.execute({ userId: user.id })

    expect(schedules).toEqual([
      {
        dayOfWeek: 1,
        workout: {
          id: 'workout-1',
          name: 'Push day',
          exercises: [
            {
              id: 'exercise-1',
              name: 'Bench press',
              sets: 3,
              reps: 10,
              weight: 25,
            },
          ],
        },
      },
    ])
    expect(workoutsRepository.findAllByUser).toHaveBeenCalledWith(user.id)
  })

  it('should not fetch schedules for a non-existent user', async () => {
    await expect(
      sut.execute({ userId: 'non-existent-user' })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)

    expect(workoutsRepository.findAllByUser).not.toHaveBeenCalled()
  })
})
