import { NextResponse } from "next/server"

export function GET() {
  const body = `Contact: mailto:contact@galeryelfakir.com
Expires: 2027-03-03T00:00:00.000Z
Preferred-Languages: fr, en
Canonical: https://galeryelfakir.vercel.app/.well-known/security.txt
`

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
