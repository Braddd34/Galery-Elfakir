import { NextRequest, NextResponse } from "next/server"
import { getKeyFromUrl, isOurS3Url, validateS3Key, getObjectStream } from "@/lib/s3"
import { imageProxyLimiter, getClientIP } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const { success } = await imageProxyLimiter.check(ip, 60)
    if (!success) {
      return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })
    }

    const url = request.nextUrl.searchParams.get("url")
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Paramètre url manquant" }, { status: 400 })
    }

    const decoded = decodeURIComponent(url)
    if (!isOurS3Url(decoded)) {
      return NextResponse.json({ error: "URL non autorisée" }, { status: 403 })
    }

    const rawKey = getKeyFromUrl(decoded)
    if (!rawKey) {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 })
    }
    if (!validateS3Key(rawKey)) {
      return NextResponse.json({ error: "URL non autorisée" }, { status: 403 })
    }

    const result = await getObjectStream(rawKey)
    if (!result.Body) {
      return NextResponse.json({ error: "Image introuvable" }, { status: 404 })
    }

    const contentType = result.ContentType || "image/jpeg"
    const headers = new Headers()
    headers.set("Content-Type", contentType)
    headers.set("Cache-Control", "public, max-age=86400")

    const chunks: Uint8Array[] = []
    for await (const chunk of result.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk)
    }
    const bytes = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0))
    let offset = 0
    for (const c of chunks) {
      bytes.set(c, offset)
      offset += c.length
    }
    return new Response(bytes, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Erreur image-proxy:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
