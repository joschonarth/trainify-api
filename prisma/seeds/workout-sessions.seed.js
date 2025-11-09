import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedWorkoutSessions() {
  console.log('🏋️‍♂️ Seeding workout sessions...')

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

  for (const workout of workouts) {
    const workoutSession = await prisma.workoutSession.create({
      data: {
        date: new Date(),
        status: 'COMPLETED',
        userId: user.id,
        workoutId: workout.id,

        exerciseSessions: {
          create: workout.exercises.map((we, index) => {
            const sets = we.exercise.sets ?? 3
            const reps = we.exercise.reps ?? 10
            const weight = we.exercise.weight ?? 0
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
                    date: new Date(),
                    description:
                      index % 2 === 0
                        ? 'Execução padrão'
                        : 'Teste de carga progressiva',
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
      `✅ Workout session created for "${workout.name}" with ${workoutSession.exerciseSessions.length} exercises.`,
    )
  }
}
