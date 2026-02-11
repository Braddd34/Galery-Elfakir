"use client"

import Link from "next/link"

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-light mb-3">Erreur administration</h2>
        <p className="text-neutral-500 text-sm mb-6">Une erreur est survenue dans le panneau admin.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-6 py-3 bg-white text-black text-sm uppercase tracking-wider hover:bg-gold transition-colors">Réessayer</button>
          <Link href="/dashboard" className="px-6 py-3 border border-neutral-700 text-sm uppercase tracking-wider hover:border-white transition-colors">Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
