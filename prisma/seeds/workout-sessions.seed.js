import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedWorkoutSessions() {
  console.log('🔥 Seeding completed workout sessions...')

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
      const sessionDate = new Date()
      sessionDate.setDate(today.getDate() - week * 7 + schedule.dayOfWeek)

      const startHour = 18
      const startMin = Math.floor(Math.random() * 30)

      const startedAt = new Date(sessionDate)
      startedAt.setHours(startHour, startMin, 0)

      const endedAt = new Date(startedAt)
      endedAt.setMinutes(startedAt.getMinutes() + 40)

      const duration = Math.floor((endedAt - startedAt) / 60000)

      console.log(
        `📌 Creating COMPLETED session for workout "${workout.name}" on ${sessionDate}`,
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
              const exStart = new Date(startedAt)
              exStart.setMinutes(exStart.getMinutes() + index * 7)

              const exEnd = new Date(exStart)
              exEnd.setMinutes(exEnd.getMinutes() + 5)

              const plannedSets = we.defaultSets ?? 3
              const plannedReps = we.defaultReps ?? 12
              const plannedWeight = we.defaultWeight ?? 0

              const volume = plannedSets * plannedReps * (plannedWeight || 1)

              return {
                exerciseId: we.exerciseId,

                completed: true,
                plannedSets,
                plannedReps,
                plannedWeight,

                startedAt: exStart,
                endedAt: exEnd,
                duration: Math.floor((exEnd - exStart) / 60000),

                logs: {
                  create: {
                    sets: plannedSets,
                    reps: plannedReps,
                    weight: plannedWeight,
                    volume,
                    description: 'A última repetição foi difícil.',
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

  console.log('✅ Completed workout sessions seeded!')
}
