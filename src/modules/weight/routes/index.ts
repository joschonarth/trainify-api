import { FastifyInstance } from 'fastify'

import { verifyJwt } from '@/middlewares/verify-jwt'
import { achieveWeightGoalController } from '@/modules/weight/controllers/achieve-weight-goal.controller'
import { createWeightGoalController } from '@/modules/weight/controllers/create-weight-goal.controller'
import { getActiveGoalWeightAnalyticsController } from '@/modules/weight/controllers/get-active-goal-weight-analytics.controller'
import { getGeneralWeightAnalyticsController } from '@/modules/weight/controllers/get-general-weight-analytics.controller'
import { getWeightGoalController } from '@/modules/weight/controllers/get-weight-goal.controller'
import { getWeightSummaryController } from '@/modules/weight/controllers/get-weight-summary.controller'
import { listWeightGoalsController } from '@/modules/weight/controllers/list-weight-goals.controller'
import { listWeightLogsController } from '@/modules/weight/controllers/list-weight-logs.controller'
import { logWeightController } from '@/modules/weight/controllers/log-weight.controller'
import { updateWeightGoalController } from '@/modules/weight/controllers/update-weight-goal.controller'

import { getWeightLogController } from '../controllers/get-weight-log.controller'
import { updateWeightLogController } from '../controllers/update-weight-log.controller'

export async function weightRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  /** Weight Logs */
  app.get('/weight/logs', listWeightLogsController)
  app.get('/weight/logs/:logId', getWeightLogController)
  app.post('/weight/logs', logWeightController)
  app.put('/weight/logs/:logId', updateWeightLogController)

  /** Weight Goals */
  app.get('/weight/goals/:goalId', getWeightGoalController)
  app.get('/weight/goals', listWeightGoalsController)
  app.post('/weight/goals', createWeightGoalController)
  app.patch('/weight/goals/:goalId/achieve', achieveWeightGoalController)
  app.put('/weight/goals/:goalId', updateWeightGoalController)

  /** Metrics */
  app.get('/weight/summary', getWeightSummaryController)
  app.get('/weight/analytics/general', getGeneralWeightAnalyticsController)
  app.get('/weight/analytics/goal', getActiveGoalWeightAnalyticsController)
}
