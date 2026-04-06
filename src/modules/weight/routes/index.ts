import type { FastifyInstance } from 'fastify'

import { achieveWeightGoalRoute } from './achieve-weight-goal.route'
import { createWeightGoalRoute } from './create-weight-goal.route'
import { createWeightLogRoute } from './create-weight-log.route'
import { deactivateWeightGoalRoute } from './deactivate-weight-goal.route'
import { deleteWeightGoalRoute } from './delete-weight-goal.route'
import { deleteWeightLogRoute } from './delete-weight-log.route'
import { getActiveWeightGoalRoute } from './get-active-weight-goal.route'
import { getActiveWeightGoalAnalyticsRoute } from './get-active-weight-goal-analytics.route'
import { getGeneralWeightAnalyticsRoute } from './get-general-weight-analytics.route'
import { getWeightGoalRoute } from './get-weight-goal.route'
import { getWeightGoalLogsRoute } from './get-weight-goal-logs.route'
import { getWeightLogRoute } from './get-weight-log.route'
import { getWeightSummaryRoute } from './get-weight-summary.route'
import { listWeightGoalsRoute } from './list-weight-goals.route'
import { listWeightLogsRoute } from './list-weight-logs.route'
import { updateWeightGoalRoute } from './update-weight-goal.route'
import { updateWeightLogRoute } from './update-weight-log.route'

export function weightRoutes(app: FastifyInstance) {
  app.register(listWeightLogsRoute)
  app.register(getWeightLogRoute)
  app.register(createWeightLogRoute)
  app.register(updateWeightLogRoute)
  app.register(deleteWeightLogRoute)
  app.register(getWeightGoalRoute)
  app.register(getWeightGoalLogsRoute)
  app.register(getActiveWeightGoalRoute)
  app.register(listWeightGoalsRoute)
  app.register(createWeightGoalRoute)
  app.register(achieveWeightGoalRoute)
  app.register(deactivateWeightGoalRoute)
  app.register(updateWeightGoalRoute)
  app.register(deleteWeightGoalRoute)
  app.register(getWeightSummaryRoute)
  app.register(getGeneralWeightAnalyticsRoute)
  app.register(getActiveWeightGoalAnalyticsRoute)
}
