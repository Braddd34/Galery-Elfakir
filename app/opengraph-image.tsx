import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "ELFAKIR — Galerie d'Art Contemporain"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #1a1a1a 100%)",
          color: "white",
          fontFamily: "serif",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 110,
            letterSpacing: "0.3em",
            fontWeight: 200,
            color: "white",
            textAlign: "center",
          }}
        >
          ELFAKIR
        </div>
        <div
          style={{
            marginTop: 40,
            width: 80,
            height: 1,
            backgroundColor: "#c4a747",
          }}
        />
        <div
          style={{
            marginTop: 40,
            fontSize: 36,
            color: "#c4a747",
            textAlign: "center",
            fontWeight: 300,
          }}
        >
          Galerie d&apos;Art Contemporain
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 22,
            color: "#999999",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Œuvres originales d&apos;artistes internationaux
        </div>
      </div>
    ),
    { ...size }
  )
}
