import { NextRequest, NextResponse } from "next/server"

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || ""
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

export async function POST(request: NextRequest) {
  try {
    if (!TURNSTILE_SECRET) {
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

    const body = new URLSearchParams({
      secret: TURNSTILE_SECRET,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    })

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })

    const data = await res.json()

    if (!data.success) {
      return NextResponse.json({ error: "Vérification échouée" }, { status: 403 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
