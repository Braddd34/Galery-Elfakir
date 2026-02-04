"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { CartProvider } from "@/lib/cart-context"
import { ToastProvider } from "@/lib/toast-context"

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NextAuthSessionProvider>
      <ToastProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </ToastProvider>
    </NextAuthSessionProvider>
  )
}
