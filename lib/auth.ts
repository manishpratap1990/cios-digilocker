import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'

const SESSION_COOKIE = 'admin_session'
const SESSION_SECRET = process.env.ADMIN_SECRET || 'fallback-secret-change-in-production'

export interface AdminSession {
  adminId: string
  username: string
  loggedIn: boolean
}

function sign(payload: string): string {
  const hmac = createHmac('sha256', SESSION_SECRET)
  hmac.update(payload)
  return hmac.digest('hex')
}

function encodeSession(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64')
  const signature = sign(payload)
  return `${payload}.${signature}`
}

function decodeSession(token: string): AdminSession | null {
  try {
    const [payload, signature] = token.split('.')
    if (!payload || !signature) return null

    // Verify signature using timing-safe comparison
    const expectedSig = sign(payload)
    const sigBuffer = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSig, 'hex')
    if (sigBuffer.length !== expectedBuffer.length) return null
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null

    const session = JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as AdminSession
    if (!session.loggedIn) return null
    return session
  } catch {
    return null
  }
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)
  if (!sessionCookie?.value) return null
  return decodeSession(sessionCookie.value)
}

export async function createSession(adminId: string, username: string) {
  const cookieStore = await cookies()
  const session: AdminSession = { adminId, username, loggedIn: true }
  const token = encodeSession(session)
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' })
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
