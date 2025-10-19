import { FastifyInstance } from 'fastify'

import { metricsRoutes } from '@/modules/metric/routes'

import { gamificationRoutes } from '../modules/gamification/routes'
import { usersRoutes } from '../modules/user/routes'
import { weightRoutes } from '../modules/weight/routes'
import { workoutsRoutes } from '../modules/workout/routes'
import { exerciseLogsRoutes } from './exercise-logs.routes'
import { exercisesRoutes } from './exercises.routes'
import { workoutSessionsRoutes } from './workout-sessions.routes'

export async function appRoutes(app: FastifyInstance) {
  app.register(usersRoutes)
  app.register(exercisesRoutes)
  app.register(exerciseLogsRoutes)
  app.register(workoutsRoutes)
  app.register(workoutSessionsRoutes)
  app.register(gamificationRoutes)
  app.register(weightRoutes)
  app.register(metricsRoutes)
}
