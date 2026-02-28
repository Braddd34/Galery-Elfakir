import { NextRequest, NextResponse } from "next/server"
import { getKeyFromUrl, isOurS3Url, getObjectStream } from "@/lib/s3"

/**
 * GET /api/image-proxy?url=...
 * Sert une image stockée sur notre bucket S3 (lecture avec les identifiants serveur).
 * Utilisé quand le bucket n’est pas public pour afficher les photos de profil, etc.
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url")
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Paramètre url manquant" }, { status: 400 })
    }

    const decoded = decodeURIComponent(url)
    if (!isOurS3Url(decoded)) {
      return NextResponse.json({ error: "URL non autorisée" }, { status: 403 })
    }

    const key = getKeyFromUrl(decoded)
    if (!key) {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 })
    }

    const result = await getObjectStream(key)
    if (!result.Body) {
      return NextResponse.json({ error: "Image introuvable" }, { status: 404 })
    }

    const contentType = result.ContentType || "image/jpeg"
    const headers = new Headers()
    headers.set("Content-Type", contentType)
    headers.set("Cache-Control", "public, max-age=86400")

    // Lire le stream en buffer (évite conflits de types ReadableStream Node vs Web)
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
