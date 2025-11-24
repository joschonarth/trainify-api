import { Prisma } from '@prisma/client'

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
      logs: true,
    },
  },
} satisfies Prisma.WorkoutSessionInclude
