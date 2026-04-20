import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

function buildCsp(nonce: string): string {
  return [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.public.blob.vercel-storage.com https://s3.eu-west-3.amazonaws.com https://elfakir-gallery.s3.eu-west-3.amazonaws.com https://utfs.io https://*.utfs.io",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://elfakir-gallery.s3.eu-west-3.amazonaws.com https://s3.eu-west-3.amazonaws.com https://challenges.cloudflare.com",
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
  ].join("; ")
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (path.startsWith("/admin")) {
      if (token?.userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    if (path.startsWith("/dashboard/manager")) {
      if (token?.userRole !== "MANAGER" && token?.userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    if (path.startsWith("/dashboard/artiste")) {
      if (token?.userRole !== "ARTIST" && token?.userRole !== "MANAGER" && token?.userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
    const csp = buildCsp(nonce)

    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-nonce", nonce)
    requestHeaders.set("Content-Security-Policy", csp)

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    })
    response.headers.set("Content-Security-Policy", csp)

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        if (
          path === "/" ||
          path === "/catalogue" ||
          path.startsWith("/oeuvre/") ||
          path.startsWith("/artiste/") ||
          path === "/artistes" ||
          path === "/login" ||
          path === "/register" ||
          path === "/forgot-password" ||
          path === "/reset-password" ||
          path === "/verify-email" ||
          path === "/a-propos" ||
          path === "/contact" ||
          path === "/blog" ||
          path.startsWith("/blog/") ||
          path === "/faq" ||
          path === "/confidentialite" ||
          path === "/cgv" ||
          path === "/mentions-legales" ||
          path === "/expositions-virtuelles" ||
          path.startsWith("/expositions-virtuelles/") ||
          path.startsWith("/newsletter/") ||
          path.startsWith("/api/auth") ||
          path.startsWith("/api/setup") ||
          path.startsWith("/api/virtual-exhibitions")
        ) {
          return true
        }

        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    // Exclut : assets _next, favicon, fichiers statiques, /api, et /monitoring (tunnel Sentry)
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api|monitoring).*)",
  ],
}
