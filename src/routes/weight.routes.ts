import { FastifyInstance } from 'fastify'

import { achieveWeightGoalController } from '@/controllers/weight/achieve-weight-goal.controller'
import { createWeightGoalController } from '@/controllers/weight/create-weight-goal.controller'
import { listWeightLogsController } from '@/controllers/weight/list-weight-logs.controller'
import { logWeightController } from '@/controllers/weight/log-weight.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function weightRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/weight/logs', listWeightLogsController)
  app.post('/weight/logs', logWeightController)

  app.post('/weight/goals', createWeightGoalController)
  app.patch('/weight/goals/:goalId/achieve', achieveWeightGoalController)
}
