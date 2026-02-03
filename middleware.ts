import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Routes admin - seulement pour les admins
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Routes artiste - seulement pour les artistes
    if (path.startsWith("/dashboard/artiste")) {
      if (token?.role !== "ARTIST" && token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Routes publiques
        if (
          path === "/" ||
          path === "/catalogue" ||
          path.startsWith("/oeuvre/") ||
          path.startsWith("/artiste/") ||
          path === "/login" ||
          path === "/register" ||
          path === "/a-propos" ||
          path === "/contact" ||
          path.startsWith("/api/auth")
        ) {
          return true
        }

        // Routes protégées - nécessitent un token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
  ],
}
