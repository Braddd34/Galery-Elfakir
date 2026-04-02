import { NextRequest, NextResponse } from "next/server"
import { isTurnstileEnforced, verifyTurnstileToken } from "@/lib/turnstile"

export async function POST(request: NextRequest) {
  try {
    if (!isTurnstileEnforced()) {
      return NextResponse.json({ success: true })
    }

    const { token } = await request.json()
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 })
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined

    const ok = await verifyTurnstileToken(token, ip)
    if (!ok) {
      return NextResponse.json({ error: "Vérification échouée" }, { status: 403 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
