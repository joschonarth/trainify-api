import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedWorkoutSessions() {
  console.log('🏋️‍♂️ Seeding workout sessions...')

  const user = await prisma.user.findFirst()

  if (!user) {
    console.warn('⚠️ No user found. Skipping session seed.')
    return
  }

  const workouts = await prisma.workout.findMany({
    where: { userId: user.id },
    include: {
      exercises: {
        include: { exercise: true },
      },
    },
  })

  if (workouts.length === 0) {
    console.warn('⚠️ No workouts found. Skipping session seed.')
    return
  }

  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() - 60)
  baseDate.setHours(9, 0, 0, 0)

  for (const [index, workout] of workouts.entries()) {
    const sessionDates = [
      new Date(baseDate.getTime() + index * 3 * 24 * 60 * 60 * 1000),
      new Date(baseDate.getTime() + (index * 3 + 10) * 24 * 60 * 60 * 1000),
    ]

    for (let i = 0; i < sessionDates.length; i++) {
      const sessionDate = sessionDates[i]
      const progressive = i === 1

      const workoutSession = await prisma.workoutSession.create({
        data: {
          date: sessionDate,
          status: 'COMPLETED',
          userId: user.id,
          workoutId: workout.id,

          exerciseSessions: {
            create: workout.exercises.map((we) => {
              const baseSets = we.defaultSets ?? we.exercise?.sets ?? 3
              const baseReps = we.defaultReps ?? we.exercise?.reps ?? 10
              const baseWeight = we.defaultWeight ?? we.exercise?.weight ?? 0

              const sets = progressive
                ? baseSets + Math.floor(Math.random() * 2)
                : baseSets

              const reps = progressive
                ? baseReps + Math.floor(Math.random() * 3)
                : baseReps

              const weight = progressive
                ? baseWeight + Math.floor(Math.random() * 5)
                : baseWeight

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
                      description: progressive
                        ? 'Sessão com progressão de carga'
                        : 'Sessão base',
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

  console.log('🎉 Finished seeding workout sessions!')
}
