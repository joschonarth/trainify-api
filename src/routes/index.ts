import { FastifyInstance } from 'fastify'

import { exerciseLogsRoutes } from './exercise-logs.routes'
import { exercisesRoutes } from './exercises.routes'
import { gamificationRoutes } from './gamification.routes'
import { usersRoutes } from './users.routes'
import { workoutSessionsRoutes } from './workout-sessions.routes'
import { workoutsRoutes } from './workouts.routes'

export async function appRoutes(app: FastifyInstance) {
  app.register(usersRoutes)
  app.register(exercisesRoutes)
  app.register(exerciseLogsRoutes)
  app.register(workoutsRoutes)
  app.register(workoutSessionsRoutes)
  app.register(gamificationRoutes)
}
