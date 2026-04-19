import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

type Role = "ADMIN" | "ARTIST" | "MANAGER" | "BUYER"

interface AuthResult {
  session: { user: { id: string; role: string; email?: string | null; name?: string | null } }
}

/**
 * Vérifie l'authentification et optionnellement le rôle.
 * Retourne la session ou une NextResponse d'erreur.
 */
export async function requireAuth(
  roles?: Role[]
): Promise<AuthResult | NextResponse> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  if (roles && roles.length > 0) {
    const userRole = (session.user as { role?: string }).role
    if (!userRole || !roles.includes(userRole as Role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
  }

  return { session: session as unknown as AuthResult["session"] }
}

/**
 * Type guard : vérifie si le résultat de requireAuth est une erreur HTTP.
 */
export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse
}
