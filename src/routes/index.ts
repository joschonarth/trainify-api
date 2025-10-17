import { FastifyInstance } from 'fastify'

import { gamificationRoutes } from '../modules/gamification/routes'
import { weightRoutes } from '../modules/weight/routes'
import { exerciseLogsRoutes } from './exercise-logs.routes'
import { exercisesRoutes } from './exercises.routes'
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
  app.register(weightRoutes)
}
