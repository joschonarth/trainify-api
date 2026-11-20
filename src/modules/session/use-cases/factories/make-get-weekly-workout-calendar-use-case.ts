import { PrismaStreakPlansRepository } from '@/modules/gamification/streak/repositories/prisma/prisma-streak-plans.repository'
import { PrismaUserStreakLogsRepository } from '@/modules/gamification/streak/repositories/prisma/prisma-user-streak-logs.repository'
import { GetPlanningCalendarContext } from '@/modules/gamification/streak/use-cases/get-planning-calendar-context'
import { PrismaWorkoutSessionsRepository } from '@/modules/session/repositories/prisma/prisma-workout-sessions.repository'
import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'

import { GetWeeklyWorkoutCalendarUseCase } from '../get-weekly-workout-calendar.use-case'

export function makeGetWeeklyWorkoutCalendarUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const usersRepository = new PrismaUsersRepository()
  const streakPlansRepository = new PrismaStreakPlansRepository()
  const streakLogsRepository = new PrismaUserStreakLogsRepository()
  const planning = new GetPlanningCalendarContext(
    streakPlansRepository,
    streakLogsRepository
  )
  const getWeeklyWorkoutCalendarUseCase = new GetWeeklyWorkoutCalendarUseCase(
    workoutSessionsRepository,
    usersRepository,
    planning
  )

  return getWeeklyWorkoutCalendarUseCase
}
