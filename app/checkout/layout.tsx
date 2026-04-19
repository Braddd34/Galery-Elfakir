import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Commande",
  description: "Finalisez votre commande sur ELFAKIR — livraison sécurisée et certificat d'authenticité inclus.",
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
