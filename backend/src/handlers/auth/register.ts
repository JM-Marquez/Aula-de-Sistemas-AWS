import {
  createMagicLinkToken,
  hashPassword,
  isValidEmail,
} from '../../lib/auth.js'
import { badRequest, ok, parseBody, withErrors } from '../../lib/http.js'
import { getRepository } from '../../repository/factory.js'

import { sendEmailVerification } from '../../lib/mailer.js'

interface Body {
  email?: string
  password?: string
}

const VERIFICATION_MINUTES = 30

export const handler = withErrors('POST /auth/register', async (event) => {
  const body = parseBody<Body>(event)
  const email = (body.email ?? '').trim().toLowerCase()
  const password = body.password ?? ''

  if (!isValidEmail(email)) {
    throw badRequest('Introduce un correo electrónico válido.')
  }

  if (password.length < 10 || password.length > 200) {
    throw badRequest('La contraseña debe tener entre 10 y 200 caracteres.')
  }

  const repository = getRepository()

  const existingUser = await repository.findUserByEmail(email)

  if (existingUser) {
    return ok({
      message: 'Si el registro puede completarse, recibirás un correo de confirmación.',
    })
  }

  const userId = crypto.randomUUID()
  const now = new Date().toISOString()

  const user = await repository.createUser({
    id: userId,
    email,
    createdAt: now,
    passwordHash: await hashPassword(password),
    emailVerified: false,
  })

  const token = createMagicLinkToken()
  const expiresAt = new Date(
    Date.now() + VERIFICATION_MINUTES * 60_000,
  ).toISOString()

  await repository.saveEmailVerificationToken({
    token,
    userId: user.id,
    expiresAt,
  })

  await sendEmailVerification({
    to: email,
    token,
    expiresInMinutes: VERIFICATION_MINUTES,
  })

  return ok({
    message: 'Si el registro puede completarse, recibirás un correo de confirmación.',
  })
})