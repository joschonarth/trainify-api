import type { FastifyInstance } from 'fastify'

import { exercisesRoutes } from '@/modules/exercise/routes'
import { gamificationRoutes } from '@/modules/gamification/routes'
import { metricsRoutes } from '@/modules/metric/routes'
import { sessionsRoutes } from '@/modules/session/routes'
import { usersRoutes } from '@/modules/user/routes'
import { weightRoutes } from '@/modules/weight/routes'
import { workoutsRoutes } from '@/modules/workout/routes'

export function appRoutes(app: FastifyInstance) {
  app.get('/health', () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  })

  app.register(usersRoutes)
  app.register(exercisesRoutes)
  app.register(workoutsRoutes)
  app.register(sessionsRoutes)
  app.register(gamificationRoutes)
  app.register(weightRoutes)
  app.register(metricsRoutes)
}
