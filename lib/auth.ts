import { cookies } from 'next/headers'

const SESSION_COOKIE = 'admin_session'
const SESSION_SECRET = process.env.ADMIN_SECRET || 'fallback-secret'

export interface AdminSession {
  adminId: string
  username: string
  loggedIn: boolean
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)

  if (!sessionCookie?.value) return null

  try {
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf8')
    const session = JSON.parse(decoded) as AdminSession
    if (session.loggedIn) return session
    return null
  } catch {
    return null
  }
}

export async function createSession(adminId: string, username: string) {
  const cookieStore = await cookies()
  const session: AdminSession = { adminId, username, loggedIn: true }
  const encoded = Buffer.from(JSON.stringify(session)).toString('base64')
  cookieStore.set(SESSION_COOKIE, encoded, {
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

// For use in route handlers (non-async context)
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
