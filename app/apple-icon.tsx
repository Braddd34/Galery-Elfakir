import { ImageResponse } from "next/og"

/**
 * Génère l'icône Apple Touch (pour l'ajout à l'écran d'accueil iOS).
 * 180x180px avec le logo ELFAKIR stylisé.
 */
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 80,
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#c9a962",
          fontWeight: 300,
          fontFamily: "serif",
          letterSpacing: "0.1em",
        }}
      >
        E
      </div>
    ),
    { ...size }
  )
}
