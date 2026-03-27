import type { FastifyReply, FastifyRequest } from 'fastify'

import { InvalidCredentialsError } from '@/modules/user/errors/invalid-credentials.error'
import { PasswordsDoNotMatchError } from '@/modules/user/errors/passwords-do-not-match.error'
import { makeChangePasswordUseCase } from '@/modules/user/use-cases/factories/make-change-password-use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { ChangePasswordBody } from '../schemas/change-password.schema'

export async function changePasswordController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { currentPassword, newPassword, passwordConfirmation } =
    request.body as ChangePasswordBody

  try {
    const changePasswordUseCase = makeChangePasswordUseCase()

    await changePasswordUseCase.execute({
      userId: request.user.userId,
      currentPassword,
      newPassword,
      passwordConfirmation,
    })

    return reply.status(200).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: error.message })
    }

    if (error instanceof PasswordsDoNotMatchError) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }
}
