import type { FastifyInstance } from 'fastify'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'

import { achieveWeightGoalController } from '../controllers/achieve-weight-goal.controller'
import { createWeightGoalController } from '../controllers/create-weight-goal.controller'
import { createWeightLogController } from '../controllers/create-weight-log.controller'
import { deactivateWeightGoalController } from '../controllers/deactivate-weight-goal.controller'
import { deleteWeightGoalController } from '../controllers/delete-weight-goal.controller'
import { deleteWeightLogController } from '../controllers/delete-weight-log.controller'
import { getActiveWeightGoalController } from '../controllers/get-active-weight-goal.controller'
import { getActiveWeightGoalAnalyticsController } from '../controllers/get-active-weight-goal-analytics.controller'
import { getGeneralWeightAnalyticsController } from '../controllers/get-general-weight-analytics.controller'
import { getWeightGoalController } from '../controllers/get-weight-goal.controller'
import { getWeightGoalLogsController } from '../controllers/get-weight-goal-logs.controller'
import { getWeightLogController } from '../controllers/get-weight-log.controller'
import { getWeightSummaryController } from '../controllers/get-weight-summary.controller'
import { listWeightGoalsController } from '../controllers/list-weight-goals.controller'
import { listWeightLogsController } from '../controllers/list-weight-logs.controller'
import { updateWeightGoalController } from '../controllers/update-weight-goal.controller'
import { updateWeightLogController } from '../controllers/update-weight-log.controller'

export async function weightRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  /** Weight Logs */
  app.get('/weight/logs', listWeightLogsController)
  app.get('/weight/logs/:logId', getWeightLogController)
  app.post('/weight/logs', createWeightLogController)
  app.put('/weight/logs/:logId', updateWeightLogController)
  app.delete('/weight/logs/:logId', deleteWeightLogController)

  /** Weight Goals */
  app.get('/weight/goals/:goalId', getWeightGoalController)
  app.get('/weight/goals/:goalId/logs', getWeightGoalLogsController)
  app.get('/weight/goals/active', getActiveWeightGoalController)
  app.get('/weight/goals', listWeightGoalsController)
  app.post('/weight/goals', createWeightGoalController)
  app.patch('/weight/goals/:goalId/achieve', achieveWeightGoalController)
  app.patch('/weight/goals/:goalId/deactivate', deactivateWeightGoalController)
  app.put('/weight/goals/:goalId', updateWeightGoalController)
  app.delete('/weight/goals/:goalId', deleteWeightGoalController)

  /** Metrics */
  app.get('/weight/summary', getWeightSummaryController)
  app.get('/weight/analytics/general', getGeneralWeightAnalyticsController)
  app.get('/weight/analytics/goal', getActiveWeightGoalAnalyticsController)
}
