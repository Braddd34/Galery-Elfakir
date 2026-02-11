import { ImageResponse } from "next/og"

/**
 * Génère dynamiquement le favicon/icône du site.
 * Next.js sert automatiquement ce fichier comme favicon.
 * Fond noir avec le texte "E" doré.
 */
export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#c9a962",
          fontWeight: 300,
          fontFamily: "serif",
          letterSpacing: "0.05em",
        }}
      >
        E
      </div>
    ),
    { ...size }
  )
}
