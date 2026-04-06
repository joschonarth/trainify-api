import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import type { FastifyInstance } from 'fastify'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

export async function registerSwagger(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Trainify API',
        description: 'API documentation for Trainify',
        version: '1.0.0',
      },
      tags: [
        { name: 'Health', description: 'API health check.' },
        { name: 'Users', description: 'User management and authentication.' },
        {
          name: 'Exercises',
          description: 'Exercise catalog and user exercises.',
        },
        { name: 'Exercise Logs', description: 'Exercise log tracking.' },
        { name: 'Workouts', description: 'Workout management and scheduling.' },
        {
          name: 'Sessions',
          description: 'Workout session tracking and analytics.',
        },
        { name: 'Gamification', description: 'Streaks and badges.' },
        { name: 'Weight', description: 'Weight logs and goals.' },
        { name: 'Metrics', description: 'Overall user fitness metrics.' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  })

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  })
}
