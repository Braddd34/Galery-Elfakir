"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log l'erreur pour le debugging
    console.error("Erreur application:", error)
  }, [error])

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        {/* Icône erreur */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-light mb-4">
          Une erreur est survenue
        </h1>
        <p className="text-neutral-400 mb-8">
          Nous sommes désolés, quelque chose s'est mal passé. 
          Notre équipe a été notifiée et travaille sur le problème.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 bg-white text-black text-sm tracking-wider uppercase hover:bg-neutral-200 transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="px-8 py-3 border border-neutral-700 text-sm tracking-wider uppercase hover:border-white transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>

        {/* ID erreur pour le support */}
        {error.digest && (
          <p className="mt-12 text-neutral-700 text-xs">
            ID erreur : {error.digest}
          </p>
        )}
      </div>
    </main>
  )
}
