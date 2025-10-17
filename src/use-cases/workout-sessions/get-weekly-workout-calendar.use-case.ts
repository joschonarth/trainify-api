import dayjs from 'dayjs'

import { WorkoutSessionsRepository } from '@/repositories/workout-sessions.repository'

interface CalendarWeekStatus {
  date: string
  completed: boolean
}

interface GetWeeklyWorkoutCalendarResponse {
  week: CalendarWeekStatus[]
}

export class GetWeeklyWorkoutCalendarUseCase {
  constructor(private workoutSessionsRepository: WorkoutSessionsRepository) {}

  async execute(userId: string): Promise<GetWeeklyWorkoutCalendarResponse> {
    const sessions = await this.workoutSessionsRepository.findAllByUser(userId)

    const today = dayjs()
    const startOfWeek = today.startOf('week')

    const weekDates = Array.from({ length: 7 }, (_, i) =>
      startOfWeek.add(i, 'day'),
    )

    const weekStatus: CalendarWeekStatus[] = weekDates.map((date) => {
      const sessionForDay = sessions.find((s) =>
        dayjs(s.date).isSame(date, 'day'),
      )

      return {
        date: date.format('YYYY-MM-DD'),
        completed: sessionForDay?.status === 'COMPLETED',
      }
    })

    return { week: weekStatus }
  }
}
