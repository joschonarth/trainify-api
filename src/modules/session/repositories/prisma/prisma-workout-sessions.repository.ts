import dayjs from 'dayjs'
import type {
  Prisma,
  PrismaClient,
  WorkoutSession,
  WorkoutSessionStatus,
} from 'generated/prisma'
import { prisma } from '@/lib/prisma'
import { PrismaStreakPlansRepository } from '@/modules/gamification/streak/repositories/prisma/prisma-streak-plans.repository'
import { getZonedDayRange } from '@/shared/utils/date-timezone'

import type {
  DailySessionRequest,
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '../workout-sessions.repository'
import { workoutSessionInclude } from './includes/workout-session.include'
import { mapWorkoutSession } from './mappers/workout-session.mapper'

export class PrismaWorkoutSessionsRepository
  implements WorkoutSessionsRepository
{
  constructor(
    private readonly client: Prisma.TransactionClient | PrismaClient = prisma,
    private readonly rootClient: PrismaClient = prisma
  ) {}

  async resolveDailySession(
    request: DailySessionRequest,
    create?: Prisma.WorkoutSessionUncheckedCreateInput
  ): Promise<WorkoutSessionWithWorkout | null> {
    return await this.rootClient.$transaction(async (transaction) => {
      // Serialize creation and legacy adoption by user, including requests for different timezones.
      await transaction.$queryRaw`SELECT id FROM users WHERE id = ${request.userId} FOR UPDATE`
      const identity = await transaction.dailyWorkoutSession.findUnique({
        where: {
          userId_businessDate: {
            userId: request.userId,
            businessDate: request.businessDate,
          },
        },
      })
      let sessionId = identity?.sessionId
      if (!sessionId) {
        // Lazily adopt the earliest unclaimed legacy session; never delete duplicate history.
        const legacy = await transaction.workoutSession.findFirst({
          where: {
            userId: request.userId,
            date: { gte: request.start, lte: request.end },
            dailyIdentity: null,
          },
          orderBy: [{ date: 'asc' }, { id: 'asc' }],
        })
        if (create && !legacy) {
          const tracking = await new PrismaStreakPlansRepository(
            transaction
          ).findByUser(request.userId)
          const version = tracking?.versions
            .filter((item) => item.effectiveDate <= request.businessDate)
            .at(-1)
          if (
            version &&
            version.workouts[String(dayjs.utc(request.businessDate).day())] !==
              create.workoutId
          ) {
            return null
          }
        }
        const session =
          legacy ??
          (create
            ? await transaction.workoutSession.create({ data: create })
            : null)
        if (!session) {
          return null
        }
        const dailyIdentity = await transaction.dailyWorkoutSession.create({
          data: {
            userId: request.userId,
            businessDate: request.businessDate,
            timezone: request.timezone,
            sessionId: session.id,
          },
        })
        sessionId = dailyIdentity.sessionId
      }
      const session = await transaction.workoutSession.findUnique({
        where: { id: sessionId },
        include: workoutSessionInclude,
      })
      return session ? mapWorkoutSession(session) : null
    })
  }

  async findById(id: string) {
    return await this.client.workoutSession.findUnique({
      where: { id },
      include: { dailyIdentity: true },
    })
  }

  async findByUserAndDate(
    userId: string,
    date: Date,
    timezone: string
  ): Promise<WorkoutSession | null> {
    const { start, end } = getZonedDayRange(date, timezone)

    return await prisma.workoutSession.findFirst({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
    })
  }

  async findByIdWithWorkout(
    id: string
  ): Promise<WorkoutSessionWithWorkout | null> {
    if (this.client !== prisma) {
      await this.client
        .$queryRaw`SELECT id FROM workout_sessions WHERE id = ${id} FOR UPDATE`
    }
    const session = await this.client.workoutSession.findUnique({
      where: { id },
      include: workoutSessionInclude,
    })

    return session ? mapWorkoutSession(session) : null
  }

  async findAllByUser(userId: string): Promise<WorkoutSessionWithWorkout[]> {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      include: workoutSessionInclude,
      orderBy: { date: 'desc' },
    })

    return sessions.map(mapWorkoutSession)
  }

  async findHistoryByUser({
    userId,
    from,
    to,
    status,
    workoutId,
    skip,
    take,
  }: {
    userId: string
    from?: Date
    to?: Date
    status?: WorkoutSessionStatus
    workoutId?: string
    skip: number
    take: number
  }) {
    const where: Prisma.WorkoutSessionWhereInput = {
      userId,
      ...(status && { status }),
      ...(workoutId && { workoutId }),
      ...((from || to) && {
        date: {
          ...(from && { gte: from }),
          ...(to && { lte: to }),
        },
      }),
    }

    const [sessions, total] = await Promise.all([
      this.client.workoutSession.findMany({
        where,
        skip,
        take,
        orderBy: [{ date: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          date: true,
          status: true,
          startedAt: true,
          endedAt: true,
          duration: true,
          workout: {
            select: {
              name: true,
              exercises: { select: { exerciseId: true, position: true } },
            },
          },
          exerciseSessions: {
            orderBy: { position: 'asc' },
            select: {
              id: true,
              exerciseId: true,
              position: true,
              plannedSets: true,
              plannedReps: true,
              plannedWeight: true,
              completed: true,
              skipReason: true,
              startedAt: true,
              endedAt: true,
              duration: true,
              exercise: { select: { name: true } },
              logs: {
                take: 1,
                orderBy: { date: 'desc' },
                select: {
                  sets: true,
                  reps: true,
                  weight: true,
                  description: true,
                },
              },
            },
          },
        },
      }),
      this.client.workoutSession.count({ where }),
    ])

    return { sessions, total }
  }

  async findByIdWithWorkoutAndExerciseSessions(
    id: string
  ): Promise<WorkoutSessionWithWorkout | null> {
    const session = await prisma.workoutSession.findUnique({
      where: { id },
      include: workoutSessionInclude,
    })

    return session ? mapWorkoutSession(session) : null
  }

  async findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    timezone = 'UTC'
  ): Promise<
    {
      id: string
      date: Date
      status: WorkoutSessionStatus
      businessDate: string | null
    }[]
  > {
    const sessions = await this.client.workoutSession.findMany({
      where: {
        userId,
        OR: [
          {
            dailyIdentity: {
              is: {
                businessDate: {
                  gte: dayjs(startDate).tz(timezone).format('YYYY-MM-DD'),
                  lte: dayjs(endDate).tz(timezone).format('YYYY-MM-DD'),
                },
              },
            },
          },
          { dailyIdentity: null, date: { gte: startDate, lte: endDate } },
        ],
      },
      select: {
        id: true,
        date: true,
        status: true,
        dailyIdentity: { select: { businessDate: true } },
      },
      orderBy: { date: 'asc' },
    })
    return sessions.map(({ dailyIdentity, ...session }) => ({
      ...session,
      businessDate: dailyIdentity?.businessDate ?? null,
    }))
  }

  async findManyByWorkoutAndUser(
    userId: string,
    workoutId: string
  ): Promise<WorkoutSessionWithWorkout[]> {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId, workoutId },
      include: workoutSessionInclude,
      orderBy: { date: 'desc' },
    })

    return sessions.map(mapWorkoutSession)
  }

  async findManyByWorkoutId(workoutId: string, userId: string) {
    return await prisma.workoutSession.findMany({
      where: {
        workoutId,
        userId,
      },
      include: {
        exerciseSessions: {
          include: {
            exercise: true,
            logs: true,
          },
        },
        workout: true,
      },
      orderBy: {
        date: 'asc',
      },
    })
  }

  async findDetailedByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    timezone = 'UTC'
  ): Promise<WorkoutSessionWithWorkout[]> {
    const sessions = await this.client.workoutSession.findMany({
      where: {
        userId,
        OR: [
          {
            dailyIdentity: {
              is: {
                businessDate: {
                  gte: dayjs(startDate).tz(timezone).format('YYYY-MM-DD'),
                  lte: dayjs(endDate).tz(timezone).format('YYYY-MM-DD'),
                },
              },
            },
          },
          { dailyIdentity: null, date: { gte: startDate, lte: endDate } },
        ],
      },
      include: workoutSessionInclude,
      orderBy: { date: 'asc' },
    })

    return sessions.map(mapWorkoutSession)
  }

  async create(
    data: Prisma.WorkoutSessionUncheckedCreateInput
  ): Promise<WorkoutSession> {
    return await prisma.workoutSession.create({ data })
  }

  async update(
    id: string,
    data: Prisma.WorkoutSessionUpdateInput
  ): Promise<WorkoutSession> {
    return await this.client.workoutSession.update({
      where: { id },
      data,
    })
  }

  async updateStatus(
    id: string,
    status: WorkoutSessionStatus
  ): Promise<WorkoutSession> {
    return await prisma.workoutSession.update({
      where: { id },
      data: { status },
    })
  }

  async countCompletedByUser(userId: string): Promise<number> {
    return await prisma.workoutSession.count({
      where: {
        userId,
        status: 'COMPLETED',
      },
    })
  }
}
