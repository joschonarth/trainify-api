import dayjs from 'dayjs'
import timezonePlugin from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getZonedMonthRange } from '@/shared/utils/date-timezone'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

interface CalendarDayStatus {
  date: string
  completed: boolean
}

interface GetMonthlyWorkoutCalendarResponse {
  days: CalendarDayStatus[]
}

export class GetMonthlyWorkoutCalendarUseCase {
  constructor(
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'findByUserAndDateRange'
    >,
    private readonly usersRepository: Pick<UsersRepository, 'findById'>
  ) {}

  async execute(
    userId: string,
    year?: number,
    month?: number
  ): Promise<GetMonthlyWorkoutCalendarResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError('User not found.')
    }

    const today = dayjs().tz(user.timezone)
    const currentYear = year ?? today.year()
    const currentMonth = month ?? today.month() + 1
    const { start, end, startDay, endDay } = getZonedMonthRange(
      currentYear,
      currentMonth,
      user.timezone
    )

    const sessions =
      await this.workoutSessionsRepository.findByUserAndDateRange(
        userId,
        start,
        end
      )

    const totalDays = endDay.date()
    const daysArray = Array.from({ length: totalDays }, (_, i) =>
      startDay.add(i, 'day')
    )

    const days: CalendarDayStatus[] = daysArray.map((date) => {
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

    return { days }
  }
}
