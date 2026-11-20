import { dayjs } from './dates.js'

async function seedWorkoutSessionsForSchedule(prisma, schedule, user) {
  const workout = schedule.workout
  const today = dayjs.utc(
    dayjs(user.createdAt).tz(user.timezone).format('YYYY-MM-DD')
  )
  const daysAgo = (today.day() - schedule.dayOfWeek + 7) % 7 || 7
  const targetDate = today.subtract(daysAgo, 'day')

  for (let week = 1; week <= 8; week++) {
    const localDate = targetDate
      .subtract((8 - week) * 7, 'day')
      .format('YYYY-MM-DD')
    const sessionDate = dayjs.tz(localDate, user.timezone).toDate()

    const startedAt = dayjs.tz(`${localDate} 18:15`, user.timezone).toDate()

    const endedAt = new Date(startedAt)
    endedAt.setMinutes(endedAt.getMinutes() + 40)
    const duration = Math.floor(
      (endedAt.getTime() - startedAt.getTime()) / 1000
    )

    console.log(
      `📌 Creating COMPLETED session for workout "${workout.name}" on ${sessionDate.toDateString()}`
    )

    const existingSession = await prisma.workoutSession.findFirst({
      where: { userId: user.id, workoutId: workout.id, date: sessionDate },
    })
    if (existingSession) {
      continue
    }

    await prisma.workoutSession.create({
      data: {
        userId: user.id,
        workoutId: workout.id,
        date: sessionDate,
        status: 'COMPLETED',
        startedAt,
        endedAt,
        duration,

        exerciseSessions: {
          create: [...workout.exercises]
            .sort(
              (left, right) =>
                left.position - right.position ||
                left.id.localeCompare(right.id)
            )
            .map((we, index) => {
              const setsProgression = we.defaultSets
                ? we.defaultSets + Math.floor(week / 3)
                : 3
              const repsProgression = we.defaultReps
                ? we.defaultReps + week
                : 12
              const weightProgression = we.defaultWeight
                ? we.defaultWeight + week * 2
                : 0

              const plannedSets = setsProgression
              const plannedReps = repsProgression
              const plannedWeight = weightProgression

              const exStart = new Date(startedAt)
              exStart.setMinutes(exStart.getMinutes() + index * 7)
              const exEnd = new Date(exStart)
              exEnd.setMinutes(exEnd.getMinutes() + 5)

              const volume =
                we.exercise.measurement === 'DURATION'
                  ? 0
                  : plannedSets * plannedReps * (plannedWeight ?? 0)

              return {
                exerciseId: we.exerciseId,
                completed: true,
                position: we.position,
                plannedSets,
                plannedReps,
                plannedWeight,
                startedAt: exStart,
                endedAt: exEnd,
                duration: Math.floor(
                  (exEnd.getTime() - exStart.getTime()) / 1000
                ),
                logs: {
                  create: {
                    sets: plannedSets,
                    reps: plannedReps,
                    weight: plannedWeight,
                    volume,
                    description: 'A última repetição foi desafiadora.',
                    userId: user.id,
                    exerciseId: we.exerciseId,
                    date: exEnd,
                  },
                },
              }
            }),
        },
      },
    })
  }
}

async function seedUserStreaks(prisma, userId, timezone) {
  const completedSessions = await prisma.workoutSession.findMany({
    where: { userId, status: 'COMPLETED' },
    orderBy: { endedAt: 'asc' },
  })

  if (completedSessions.length === 0) {
    console.log('⚠️ No completed sessions found, skipping streaks seed.')
    return
  }

  let currentStreak = 0
  let bestStreak = 0
  let lastDate = null

  for (const session of completedSessions) {
    const key = dayjs(session.endedAt).tz(timezone).format('YYYY-MM-DD')
    const sessionDate = dayjs.tz(key, timezone).toDate()
    if (lastDate && sessionDate.getTime() === lastDate.getTime()) {
      continue
    }

    if (lastDate) {
      const diffDays = dayjs
        .utc(key)
        .diff(
          dayjs.utc(dayjs(lastDate).tz(timezone).format('YYYY-MM-DD')),
          'day'
        )

      if (diffDays === 1) {
        currentStreak++
      } else {
        currentStreak = 1
      }
    } else {
      currentStreak = 1
    }

    if (currentStreak > bestStreak) {
      bestStreak = currentStreak
    }

    lastDate = sessionDate

    await prisma.userStreakLog.upsert({
      where: { userId_date: { userId, date: sessionDate } },
      update: {},
      create: {
        userId,
        date: sessionDate,
      },
    })
  }

  const lastWorkout = completedSessions.at(-1)?.endedAt
  if (
    dayjs
      .utc(dayjs().tz(timezone).format('YYYY-MM-DD'))
      .diff(
        dayjs.utc(dayjs(lastWorkout).tz(timezone).format('YYYY-MM-DD')),
        'day'
      ) > 1
  ) {
    currentStreak = 0
  }

  await prisma.userStreak.upsert({
    where: { userId },
    update: {
      currentStreak,
      bestStreak,
      lastWorkout,
    },
    create: {
      userId,
      currentStreak,
      bestStreak,
      lastWorkout,
    },
  })

  console.log(
    `✅ User streaks seeded! Current: ${currentStreak}, Best: ${bestStreak}`
  )
}

export async function seedWorkoutSessions(prisma, userId) {
  console.log('🔥 Seeding completed workout sessions with progression...')

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    console.error('❌ User not found.')
    return
  }

  const schedules = await prisma.workoutSchedule.findMany({
    where: { userId: user.id },
    include: {
      workout: {
        include: {
          exercises: {
            include: { exercise: true },
          },
        },
      },
    },
  })

  for (const schedule of schedules) {
    await seedWorkoutSessionsForSchedule(prisma, schedule, user)
  }

  console.log('✅ Completed workout sessions seeded with progression!')

  console.log('🔥 Seeding user streaks...')
  await seedUserStreaks(prisma, user.id, user.timezone)
}
