"use client"

/**
 * SkipLink - Lien d'évitement pour l'accessibilité
 * Permet aux utilisateurs de clavier/lecteur d'écran de sauter 
 * directement au contenu principal
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-black focus:px-6 focus:py-3 focus:text-sm focus:font-medium"
    >
      Aller au contenu principal
    </a>
  )
}
