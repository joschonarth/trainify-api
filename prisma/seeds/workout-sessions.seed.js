import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedWorkoutSessions() {
  console.log(
    '🏋️‍♂️ Seeding workout sessions (2 sessions per workout across 2 weeks)...',
  )

  const user = await prisma.user.findFirst()

  const workouts = await prisma.workout.findMany({
    where: { userId: user.id },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
      },
    },
  })

  if (!user || workouts.length === 0) {
    console.warn(
      '⚠️ User or Workouts not found, skipping workout sessions seed.',
    )
    return
  }

  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 7)
  weekStart.setHours(9, 0, 0, 0)

  for (const [index, workout] of workouts.entries()) {
    const sessionDates = [
      new Date(weekStart.getTime() + index * 24 * 60 * 60 * 1000),
      new Date(weekStart.getTime() + (index + 7) * 24 * 60 * 60 * 1000),
    ]

    for (const [sessionIndex, sessionDate] of sessionDates.entries()) {
      const isLater = sessionIndex === 1

      const workoutSession = await prisma.workoutSession.create({
        data: {
          date: sessionDate,
          status: 'COMPLETED',
          userId: user.id,
          workoutId: workout.id,

          exerciseSessions: {
            create: workout.exercises.map((we, exIndex) => {
              const baseSets = we.defaultSets ?? we.exercise?.sets ?? 3
              const baseReps = we.defaultReps ?? we.exercise?.reps ?? 10
              const baseWeight = we.defaultWeight ?? we.exercise?.weight ?? 0

              const sets =
                baseSets + (isLater ? Math.floor(Math.random() * 2) : 0)
              const reps =
                baseReps + (isLater ? Math.floor(Math.random() * 3) : 0)
              const weight =
                baseWeight + (isLater ? Math.floor(Math.random() * 5) : 0)

              const volume = sets * reps * weight

              return {
                completed: true,
                plannedSets: sets,
                plannedReps: reps,
                plannedWeight: weight,
                exerciseId: we.exerciseId,

                logs: {
                  create: [
                    {
                      sets,
                      reps,
                      weight,
                      volume,
                      date: sessionDate,
                      description:
                        exIndex % 2 === 0
                          ? 'Sessão padrão'
                          : 'Sessão com carga progressiva',
                      userId: user.id,
                      exerciseId: we.exerciseId,
                    },
                  ],
                },
              }
            }),
          },
        },
        include: {
          exerciseSessions: {
            include: {
              logs: true,
              exercise: true,
            },
          },
          workout: true,
        },
      })

      console.log(
        `✅ Created session for "${workout.name}" on ${
          sessionDate.toISOString().split('T')[0]
        } (${workoutSession.exerciseSessions.length} exercises)`,
      )
    }
  }

  console.log('🎉 Finished seeding 2 sessions per workout (one per week)!')
}
