import dayjs from 'dayjs'
import timezonePlugin from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { Prisma, PrismaClient } from 'generated/prisma'
import { prisma } from '@/lib/prisma'
import type {
  StreakPlansRepository,
  TrackingPlan,
} from '../streak-plans.repository'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

export class PrismaStreakPlansRepository implements StreakPlansRepository {
  constructor(
    private readonly client: Prisma.TransactionClient | PrismaClient = prisma
  ) {}

  async findByUser(userId: string): Promise<TrackingPlan | null> {
    const tracking = await this.client.streakTracking.findUnique({
      where: { userId },
      include: { versions: { orderBy: { effectiveDate: 'asc' } } },
    })
    return tracking
      ? {
          timezone: tracking.timezone,
          activationDate: tracking.activationDate,
          versions: tracking.versions.map((version) => ({
            effectiveDate: version.effectiveDate,
            workouts: version.workouts as Record<string, string>,
          })),
        }
      : null
  }
}

/** Caller holds the user row lock; configuration and history commit together. */
export async function scheduleStreakPlan(
  client: Prisma.TransactionClient,
  userId: string,
  now = new Date()
) {
  const user = await client.user.findUniqueOrThrow({ where: { id: userId } })
  const existing = await client.streakTracking.findUnique({ where: { userId } })
  const schedules = await client.workoutSchedule.findMany({
    where: { userId, workout: { archivedAt: null } },
  })
  if (!existing && schedules.length === 0) {
    return
  }
  const timezone = existing?.timezone ?? user.timezone
  const effectiveDate = dayjs
    .utc(dayjs(now).tz(timezone).format('YYYY-MM-DD'))
    .add(1, 'day')
    .format('YYYY-MM-DD')
  if (!existing) {
    await client.streakTracking.create({
      data: {
        userId,
        timezone,
        activationDate: effectiveDate,
      },
    })
  }
  const workouts = Object.fromEntries(
    schedules.map((schedule) => [
      String(schedule.dayOfWeek),
      schedule.workoutId,
    ])
  )
  await client.streakPlan.upsert({
    where: { userId_effectiveDate: { userId, effectiveDate } },
    create: { userId, effectiveDate, workouts },
    update: { workouts },
  })
}
