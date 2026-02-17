import { ImageResponse } from "next/og"

export const runtime = "edge"
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
          fontFamily: "Georgia, serif",
          letterSpacing: "0.1em",
          borderRadius: "24px",
        }}
      >
        E
      </div>
    ),
    { ...size }
  )
}
