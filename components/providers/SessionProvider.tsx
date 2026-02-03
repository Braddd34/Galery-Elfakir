"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { CartProvider } from "@/lib/cart-context"

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NextAuthSessionProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </NextAuthSessionProvider>
  )
}
