import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const user = request.cookies.get('user')?.value
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = [
    '/authentication/login',
    '/authentication/register',
    '/authentication/forgot-password'
  ]

  // Check if the path is public
  if (publicPaths.includes(path)) {
    // If user is already logged in, redirect to dashboard
    if (token && user) {
      const userData = JSON.parse(user)
      switch (userData.role) {
        case 'admin':
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        case 'teacher':
          return NextResponse.redirect(new URL('/teacher/dashboard', request.url))
        case 'staff':
          return NextResponse.redirect(new URL('/staff/dashboard', request.url))
        default:
          return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    return NextResponse.next()
  }

  // Protected routes - check for authentication
  if (!token || !user) {
    const loginUrl = new URL('/authentication/login', request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based access control
  const userData = JSON.parse(user)
  const role = userData.role

  // Admin routes
  if (path.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Teacher routes
  if (path.startsWith('/teacher') && role !== 'teacher') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Staff routes
  if (path.startsWith('/staff') && role !== 'staff') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
