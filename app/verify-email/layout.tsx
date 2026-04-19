import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vérification email",
  description: "Vérification de votre adresse email ELFAKIR.",
  robots: { index: false, follow: false },
}

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children
}
