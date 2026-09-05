import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return Response.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({ where: { username } })

    if (!admin) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await createSession(admin.id, admin.username)

    return Response.json({ success: true, username: admin.username })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
