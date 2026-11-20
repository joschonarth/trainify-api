import dayjs from 'dayjs'
import timezonePlugin from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getZonedMonthRange } from '@/shared/utils/date-timezone'
import type { UserStreakLogsRepository } from '../repositories/user-streak-logs.repository'
import { activityBusinessDate } from '../utils/activity-business-day'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

interface CalendarDayStatus {
  date: string
  completed: boolean
}

interface GetUserStreakCalendarRequest {
  userId: string
  month?: number
  year?: number
}

interface GetUserStreakCalendarResponse {
  days: CalendarDayStatus[]
}

export class GetUserStreakCalendarUseCase {
  constructor(
    private readonly userStreakLogsRepository: UserStreakLogsRepository,
    private readonly usersRepository: Pick<UsersRepository, 'findById'>
  ) {}

  async execute({
    userId,
    month,
    year,
  }: GetUserStreakCalendarRequest): Promise<GetUserStreakCalendarResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError('User not found.')
    }

    const today = dayjs().tz(user.timezone)
    const currentYear = year ?? today.year()
    const currentMonth = (month ?? today.month() + 1) - 1 // dayjs months are 0-based

    const { start, end, startDay, endDay } = getZonedMonthRange(
      currentYear,
      currentMonth + 1,
      user.timezone
    )

    const [legacy, canonical] = await Promise.all([
      this.userStreakLogsRepository.findByUserAndDateRange(userId, start, end),
      this.userStreakLogsRepository.findByBusinessDateRange(
        userId,
        startDay.format('YYYY-MM-DD'),
        endDay.format('YYYY-MM-DD')
      ),
    ])
    const logs = [...legacy.filter((log) => !log.businessDate), ...canonical]

    const totalDays = endDay.date()
    const daysArray = Array.from({ length: totalDays }, (_, i) =>
      startDay.add(i, 'day')
    )

    const completedDates = new Set(
      logs.map((log) => activityBusinessDate(log, user.timezone))
    )
    const days: CalendarDayStatus[] = daysArray.map((date) => {
      const calendarDate = date.format('YYYY-MM-DD')
      return {
        date: calendarDate,
        completed: completedDates.has(calendarDate),
      }
    })

    return { days }
  }
}
