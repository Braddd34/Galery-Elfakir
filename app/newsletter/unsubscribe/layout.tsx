import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Désinscription newsletter",
  description: "Gérez votre inscription à la newsletter ELFAKIR.",
  robots: { index: false, follow: false },
}

export default function UnsubscribeLayout({ children }: { children: React.ReactNode }) {
  return children
}
