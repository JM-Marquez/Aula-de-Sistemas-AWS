import {
  badRequest,
  ok,
  unauthorized,
  parseBody,
  withErrors,
} from '../../lib/http.js'
import { getRepository } from '../../repository/factory.js'

interface Body {
  token?: string
}

/**
 * POST /auth/verify-email
 *
 * Consume el token de confirmación y activa la cuenta.
 */
export const handler = withErrors('POST /auth/verify-email', async (event) => {
  const body = parseBody<Body>(event)
  const token = (body.token ?? '').trim()

  if (!token) {
    throw badRequest('Falta el token de confirmación.')
  }

  const repository = getRepository()

  const verification = await repository.consumeEmailVerificationToken(token)

  if (!verification) {
    throw unauthorized('El enlace ha caducado o ya se ha utilizado.')
  }

  await repository.markEmailVerified(verification.userId)

  return ok({ verified: true })
})