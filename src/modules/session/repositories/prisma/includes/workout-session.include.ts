import type { Prisma } from 'generated/prisma'

export const workoutSessionInclude = {
  workout: {
    include: {
      exercises: {
        include: {
          exercise: true,
        },
      },
    },
  },
  exerciseSessions: {
    include: {
      exercise: true,
      logs: { orderBy: { date: 'asc' } },
    },
  },
} satisfies Prisma.WorkoutSessionInclude
