import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== 'production'

  // Generate a nonce for each request
  const nonce = crypto.getRandomValues(new Uint8Array(16))
    .reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '')

  const scriptSrc = isDev
    ? `script-src 'self' https://www.googletagmanager.com/gtag/ https://connect.facebook.net https://www.gstatic.com https://apis.google.com https://ajax.googleapis.com https://cdn.jsdelivr.net https://widget.cloudinary.com https://upload-widget.cloudinary.com 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' 'nonce-${nonce}'`
    : `script-src 'self' https://www.googletagmanager.com/gtag/ https://connect.facebook.net https://www.gstatic.com https://apis.google.com https://ajax.googleapis.com https://cdn.jsdelivr.net https://widget.cloudinary.com https://upload-widget.cloudinary.com 'wasm-unsafe-eval' 'sha256-J9cZHZf5nVZbsm7Pqxc8RsURv1AIXkMgbhfrZvoOs/A=' 'sha256-UnthrFpGFotkvMOTp/ghVMSXoZZj9Y6epaMsaBAbUtg=' 'nonce-${nonce}'`

  // Enforce a baseline Content Security Policy to mitigate XSS and injection.
  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://ajax.googleapis.com/ https://connect.facebook.net https://www.google-analytics.com https://region1.google-analytics.com https://www.gstatic.com https://www.googleapis.com https://firebase.googleapis.com https://firebaseinstallations.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebasestorage.googleapis.com https://cdn.jsdelivr.net https://api.cloudinary.com https://res.cloudinary.com https://api.bigdatacloud.net https://api.open-meteo.com https://mpc-prod-25-s6uit34pua-wl.a.run.app https://demo-1.conversionsapigateway.com",
    "frame-src 'self' https://www.google.com/ https://www.facebook.com https://widget.cloudinary.com https://upload-widget.cloudinary.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://www.facebook.com",
    "frame-ancestors 'self'",
    'upgrade-insecure-requests',
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  response.headers.set('x-nonce', nonce)
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt
     * - sitemap.xml
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
