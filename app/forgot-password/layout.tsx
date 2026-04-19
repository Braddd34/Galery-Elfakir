import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description: "Réinitialisez votre mot de passe ELFAKIR.",
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
