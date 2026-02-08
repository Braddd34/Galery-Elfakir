import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Rejoignez ELFAKIR pour découvrir des œuvres d'art uniques, sauvegarder vos favoris et suivre vos artistes préférés.",
  robots: {
    index: false, // Pages d'auth ne doivent pas être indexées
    follow: true,
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
