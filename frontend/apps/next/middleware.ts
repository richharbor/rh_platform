import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/admin/login', '/admin/logout', '/_next', '/favicon.ico', '/api', '/assets']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAdminRoute = pathname.startsWith('/admin')
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path))

  if (!isAdminRoute || isPublic) {
    return NextResponse.next()
  }

  const token = req.cookies.get('admin_token')?.value

  if (!token) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If already authenticated and visiting login, redirect to admin home
  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
