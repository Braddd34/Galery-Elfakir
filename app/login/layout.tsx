import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte ELFAKIR pour accéder à vos favoris, suivre vos commandes et découvrir des œuvres exclusives.",
  robots: {
    index: false, // Pages d'auth ne doivent pas être indexées
    follow: true,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
