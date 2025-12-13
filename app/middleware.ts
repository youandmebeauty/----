import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Enforce a baseline Content Security Policy to mitigate XSS and injection
const csp = [
  "default-src 'self';",
  "script-src 'self';",
  "style-src 'self' 'unsafe-inline';",
  "img-src 'self' data: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com;",
  "font-src 'self' https://fonts.gstatic.com;",
  "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://www.gstatic.com https://firebasestorage.googleapis.com;",
  "frame-src 'self';",
  "object-src 'none';",
  "base-uri 'self';",
  "form-action 'self';",
  "frame-ancestors 'self';",
  'upgrade-insecure-requests;'
].join(' ')

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: '/:path*',
}
