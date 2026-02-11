import { ImageResponse } from "next/og"

/**
 * Génère automatiquement l'image Open Graph par défaut du site.
 * Cette image s'affiche quand quelqu'un partage le lien sur les réseaux sociaux.
 * Next.js sert automatiquement cette image et l'inclut dans les meta tags.
 */
export const alt = "ELFAKIR — Galerie d'Art Contemporain"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: 72,
            color: "#fff",
            letterSpacing: "0.3em",
            fontWeight: 300,
            marginBottom: 20,
          }}
        >
          ELFAKIR
        </div>

        {/* Séparateur doré */}
        <div
          style={{
            width: 80,
            height: 1,
            background: "#c9a962",
            marginBottom: 24,
          }}
        />

        {/* Sous-titre */}
        <div
          style={{
            fontSize: 24,
            color: "#999",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontWeight: 300,
          }}
        >
          Galerie d'Art Contemporain
        </div>
      </div>
    ),
    { ...size }
  )
}
