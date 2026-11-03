import { hashPassword, isValidEmail, newUserId, normalizeName, requireAdmin } from '../../lib/auth.js'
import { badRequest, conflict, created, parseBody, withErrors } from '../../lib/http.js'
import { getRepository } from '../../repository/factory.js'
import type { UserRecord } from '../../domain/types.js'

interface Body { email?: string; password?: string; name?: string }

/** POST /admin/users — alta de alumno desde una sesión administradora. */
export const handler = withErrors('POST /admin/users', async (event) => {
  await requireAdmin(event)
  const body = parseBody<Body>(event)
  const email = (body.email ?? '').trim().toLowerCase()
  const password = body.password ?? ''
  const name = normalizeName(body.name ?? '')
  if (!isValidEmail(email)) throw badRequest('El correo no es válido.')
  if (password.length < 12 || password.length > 200) throw badRequest('La contraseña debe tener al menos 12 caracteres.')
  if (!name) throw badRequest('El nombre debe tener entre 2 y 40 caracteres.')
  const repository = getRepository()
  if (await repository.findUserByEmail(email)) throw conflict('Ya existe una cuenta con ese correo.')
  const record: UserRecord = {
    id: newUserId(), email, name, createdAt: new Date().toISOString(),
    passwordHash: await hashPassword(password),
  }
  const saved = await repository.createUser(record)
  if (saved.id !== record.id) throw conflict('Ya existe una cuenta con ese correo.')
  return created({ id: saved.id, email: saved.email, name: saved.name, createdAt: saved.createdAt })
})
