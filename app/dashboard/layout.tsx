import { Metadata } from "next"

/**
 * Layout du tableau de bord utilisateur.
 * Ajoute le noindex pour empêcher Google d'indexer les pages privées.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
