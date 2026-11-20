import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import timezonePlugin from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

dayjs.extend(isoWeek)
dayjs.extend(utc)
dayjs.extend(timezonePlugin)

interface CalendarWeekStatus {
  date: string
  completed: boolean
}

interface GetWeeklyWorkoutCalendarResponse {
  week: CalendarWeekStatus[]
}

export class GetWeeklyWorkoutCalendarUseCase {
  constructor(
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'findByUserAndDateRange'
    >,
    private readonly usersRepository: Pick<UsersRepository, 'findById'>
  ) {}

  async execute(userId: string): Promise<GetWeeklyWorkoutCalendarResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError('User not found.')
    }

    const today = dayjs().tz(user.timezone)
    const startOfWeek = today.startOf('isoWeek')
    const startDate = startOfWeek.toDate()
    const endDate = startOfWeek.endOf('isoWeek').toDate()
    const sessions =
      await this.workoutSessionsRepository.findByUserAndDateRange(
        userId,
        startDate,
        endDate
      )

    const weekDates = Array.from({ length: 7 }, (_, i) =>
      startOfWeek.add(i, 'day')
    )

    const weekStatus: CalendarWeekStatus[] = weekDates.map((date) => {
      const completed = sessions.some(
        (session) =>
          session.status === 'COMPLETED' &&
          dayjs(session.date).tz(user.timezone).isSame(date, 'day')
      )

      return {
        date: date.format('YYYY-MM-DD'),
        completed,
      }
    })

    return { week: weekStatus }
  }
}
