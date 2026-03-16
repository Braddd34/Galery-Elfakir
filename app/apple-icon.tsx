import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontSize: 120,
            fontFamily: "Georgia, serif",
            fontWeight: 300,
            letterSpacing: 2,
          }}
        >
          E
        </span>
      </div>
    ),
    { ...size }
  )
}
