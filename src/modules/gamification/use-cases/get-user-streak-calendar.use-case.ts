import dayjs from 'dayjs'

import type { UserStreakLogsRepository } from '../repositories/user-streak-logs.repository'

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
    private readonly userStreakLogsRepository: UserStreakLogsRepository
  ) {}

  async execute({
    userId,
    month,
    year,
  }: GetUserStreakCalendarRequest): Promise<GetUserStreakCalendarResponse> {
    const today = dayjs()
    const currentYear = year ?? today.year()
    const currentMonth = (month ?? today.month() + 1) - 1 // dayjs months are 0-based

    const startOfMonth = dayjs(new Date(currentYear, currentMonth, 1))
    const endOfMonth = startOfMonth.endOf('month')

    const logs = await this.userStreakLogsRepository.findByUserAndDateRange(
      userId,
      startOfMonth.toDate(),
      endOfMonth.toDate()
    )

    const totalDays = endOfMonth.date()
    const daysArray = Array.from({ length: totalDays }, (_, i) =>
      startOfMonth.add(i, 'day')
    )

    const days: CalendarDayStatus[] = daysArray.map((date) => {
      const log = logs.find((l) => dayjs(l.date).isSame(date, 'day'))
      return {
        date: date.format('YYYY-MM-DD'),
        completed: Boolean(log),
      }
    })

    return { days }
  }
}
