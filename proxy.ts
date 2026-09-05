import { type NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'admin_session'

export function proxy(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE)

  if (!session?.value) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const decoded = Buffer.from(session.value, 'base64').toString('utf8')
    const data = JSON.parse(decoded)
    if (!data.loggedIn) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  } catch {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Protect all admin routes EXCEPT login
  matcher: [
    '/admin/dashboard',
    '/admin/dashboard/:path*',
    '/admin/students',
    '/admin/students/:path*',
    '/admin/import',
    '/admin/result/:path*',
  ],
}
