import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedWorkoutSessions() {
  console.log('🔥 Seeding completed workout sessions with progression...')

  const user = await prisma.user.findFirst()
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

  const today = new Date()

  for (const schedule of schedules) {
    const workout = schedule.workout

    for (let week = 1; week <= 8; week++) {
      const sessionDate = new Date(today)
      const targetDate = new Date(today)
      const dayDiff = schedule.dayOfWeek - today.getDay()
      targetDate.setDate(today.getDate() + dayDiff)

      if (targetDate > today) {
        targetDate.setDate(targetDate.getDate() - 7)
      }

      sessionDate.setDate(targetDate.getDate() - (8 - week) * 7)

      const startHour = 18
      const startMin = Math.floor(Math.random() * 30)

      const startedAt = new Date(sessionDate)
      startedAt.setHours(startHour, startMin, 0)

      const endedAt = new Date(startedAt)
      endedAt.setMinutes(endedAt.getMinutes() + 40)
      const duration = Math.floor(
        (endedAt.getTime() - startedAt.getTime()) / 1000
      )

      console.log(
        `📌 Creating COMPLETED session for workout "${workout.name}" on ${sessionDate.toDateString()}`
      )

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
            create: workout.exercises.map((we, index) => {
              const setsProgression = we.defaultSets
                ? we.defaultSets + Math.floor(week / 3)
                : 3
              const repsProgression = we.defaultReps
                ? we.defaultReps + week
                : 12
              const weightProgression = we.defaultWeight
                ? we.defaultWeight + week * 2
                : 0

              const plannedSets =
                setsProgression + Math.floor(Math.random() * 2)
              const plannedReps =
                repsProgression + Math.floor(Math.random() * 3)
              const plannedWeight =
                weightProgression + Math.floor(Math.random() * 3)

              const exStart = new Date(startedAt)
              exStart.setMinutes(exStart.getMinutes() + index * 7)
              const exEnd = new Date(exStart)
              exEnd.setMinutes(exEnd.getMinutes() + 5)

              const volume = plannedSets * plannedReps * (plannedWeight || 1)

              return {
                exerciseId: we.exerciseId,
                completed: true,
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

  console.log('✅ Completed workout sessions seeded with progression!')

  console.log('🔥 Seeding user streaks...')

  const completedSessions = await prisma.workoutSession.findMany({
    where: { userId: user.id, status: 'COMPLETED' },
    orderBy: { date: 'asc' },
  })

  if (completedSessions.length === 0) {
    console.log('⚠️ No completed sessions found, skipping streaks seed.')
  } else {
    let currentStreak = 0
    let bestStreak = 0
    let lastDate = null

    for (const session of completedSessions) {
      const sessionDate = new Date(session.date)
      sessionDate.setHours(0, 0, 0, 0)

      if (lastDate) {
        const diffDays =
          (sessionDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        if (diffDays <= 1) {
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
        where: { userId_date: { userId: user.id, date: sessionDate } },
        update: {},
        create: {
          userId: user.id,
          date: sessionDate,
        },
      })
    }

    await prisma.userStreak.upsert({
      where: { userId: user.id },
      update: {
        currentStreak,
        bestStreak,
        lastWorkout: completedSessions[completedSessions.length - 1].date,
      },
      create: {
        userId: user.id,
        currentStreak,
        bestStreak,
        lastWorkout: completedSessions[completedSessions.length - 1].date,
      },
    })

    console.log(
      `✅ User streaks seeded! Current: ${currentStreak}, Best: ${bestStreak}`
    )
  }
}
