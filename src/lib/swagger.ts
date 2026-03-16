import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import type { FastifyInstance } from 'fastify'

export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Trainify API',
        description: 'API documentation for Trainify',
        version: '1.0.0',
      },
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
  })

  await app.register(swaggerUI, {
    routePrefix: '/docs',
  })
}
