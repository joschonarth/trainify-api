import type { Prisma } from 'generated/prisma'

export const workoutSessionInclude = {
  workout: {
    include: {
      exercises: {
        orderBy: { position: 'asc' },
        include: {
          exercise: true,
        },
      },
    },
  },
  exerciseSessions: {
    orderBy: { position: 'asc' },
    include: {
      exercise: true,
      logs: { orderBy: { date: 'asc' } },
    },
  },
} satisfies Prisma.WorkoutSessionInclude
