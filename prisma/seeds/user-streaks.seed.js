import dayjs from 'dayjs'
import { PrismaStreakPlansRepository } from '../../src/modules/gamification/streak/repositories/prisma/prisma-streak-plans.repository'
import { activityBusinessDate } from '../../src/modules/gamification/streak/utils/activity-business-day'
import { evaluateTracking } from '../../src/modules/gamification/streak/utils/evaluate-tracking'
import { getSessionBusinessDay } from '../../src/modules/session/utils/session-business-day'

export async function seedUserStreaks(
  prisma,
  userId,
  timezone,
  reference = new Date()
) {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId, status: 'COMPLETED' },
    include: { dailyIdentity: true },
    orderBy: [{ date: 'asc' }, { id: 'asc' }],
  })
  const dates = [
    ...new Set(
      sessions.map((session) => getSessionBusinessDay(session).businessDate)
    ),
  ].sort()
  const plans = new PrismaStreakPlansRepository(prisma)
  let plan = await plans.findByUser(userId)
  if (!plan && dates[0]) {
    const schedules = await prisma.workoutSchedule.findMany({
      where: { userId, workout: { archivedAt: null } },
    })
    if (schedules.length) {
      await prisma.streakTracking.create({
        data: { userId, timezone, activationDate: dates[0] },
      })
      await prisma.streakPlan.create({
        data: {
          userId,
          effectiveDate: dates[0],
          workouts: Object.fromEntries(
            schedules.map((schedule) => [
              String(schedule.dayOfWeek),
              schedule.workoutId,
            ])
          ),
        },
      })
      plan = await plans.findByUser(userId)
    }
  }
  const activity = await prisma.userStreakLog.findMany({ where: { userId } })
  const existingDays = new Set(
    activity.map((log) => activityBusinessDate(log, plan?.timezone ?? timezone))
  )
  for (const businessDate of dates) {
    const date = dayjs.tz(businessDate, plan?.timezone ?? timezone).toDate()
    if (!existingDays.has(businessDate)) {
      activity.push(
        await prisma.userStreakLog.create({
          data: { userId, businessDate, date },
        })
      )
      existingDays.add(businessDate)
    }
  }
  const result = evaluateTracking(
    plan,
    activity.map((log) =>
      activityBusinessDate(log, plan?.timezone ?? timezone)
    ),
    reference
  )
  const data = {
    currentStreak: result.currentStreak,
    bestStreak: result.bestStreak,
    lastBusinessDate: result.lastBusinessDate,
    lastWorkout: result.lastWorkout,
  }
  await prisma.userStreak.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  })
  return result
}
