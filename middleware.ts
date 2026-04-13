import { NextRequest, NextResponse } from 'next/server'

function base64Nonce() {
  return Buffer.from(crypto.randomUUID()).toString('base64')
}

export function middleware(request: NextRequest) {
  const nonce = base64Nonce()

  const csp = [
    `default-src 'self'`,
    `script-src 'self' https://www.gstatic.com 'nonce-${nonce}'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://www.gstatic.com https://firebasestorage.googleapis.com`,
    `frame-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
    `upgrade-insecure-requests`,
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  response.headers.set('Content-Security-Policy', csp)
  return response
}