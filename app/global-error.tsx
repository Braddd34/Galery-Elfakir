"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Erreur globale:", error)
  }, [error])

  return (
    <html lang="fr">
      <body className="bg-black text-white min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          {/* Icône erreur critique */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-2xl md:text-3xl font-light mb-4">
            Erreur critique
          </h1>
          <p className="text-neutral-400 mb-8">
            Une erreur inattendue s'est produite. 
            Veuillez rafraîchir la page ou réessayer plus tard.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="px-8 py-3 bg-white text-black text-sm tracking-wider uppercase hover:bg-neutral-200 transition-colors"
            >
              Réessayer
            </button>
            <a
              href="/"
              className="px-8 py-3 border border-neutral-700 text-sm tracking-wider uppercase hover:border-white transition-colors"
            >
              Retour à l'accueil
            </a>
          </div>

          {/* ID erreur */}
          {error.digest && (
            <p className="mt-12 text-neutral-700 text-xs">
              Référence : {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
