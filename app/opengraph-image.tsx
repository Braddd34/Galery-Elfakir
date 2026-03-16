import { ImageResponse } from "next/og"

export const alt = "ELFAKIR — Galerie d'Art Contemporain"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            right: 40,
            bottom: 40,
            border: "1px solid #333",
            display: "flex",
          }}
        />
        <span
          style={{
            color: "#fff",
            fontSize: 72,
            fontFamily: "Georgia, serif",
            fontWeight: 300,
            letterSpacing: 24,
            marginBottom: 20,
          }}
        >
          ELFAKIR
        </span>
        <span
          style={{
            color: "#888",
            fontSize: 24,
            fontFamily: "Georgia, serif",
            fontWeight: 300,
            letterSpacing: 8,
          }}
        >
          GALERIE D&apos;ART CONTEMPORAIN
        </span>
      </div>
    ),
    { ...size }
  )
}
