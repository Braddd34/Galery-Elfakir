import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        {/* 404 visuel */}
        <div className="mb-8">
          <span className="text-[150px] md:text-[200px] font-light leading-none text-neutral-800">
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-light mb-4">
          Page non trouvée
        </h1>
        <p className="text-neutral-400 mb-8">
          L'œuvre que vous cherchez semble avoir disparu de notre galerie. 
          Elle a peut-être été vendue ou n'existe plus.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-white text-black text-sm tracking-wider uppercase hover:bg-neutral-200 transition-colors"
          >
            Retour à l'accueil
          </Link>
          <Link
            href="/catalogue"
            className="px-8 py-3 border border-neutral-700 text-sm tracking-wider uppercase hover:border-white transition-colors"
          >
            Voir le catalogue
          </Link>
        </div>

        {/* Lien contact */}
        <p className="mt-12 text-neutral-600 text-sm">
          Besoin d'aide ?{" "}
          <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors">
            Contactez-nous
          </Link>
        </p>
      </div>
    </main>
  )
}
