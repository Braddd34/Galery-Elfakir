"use client"

interface CertificateClientProps {
  artwork: {
    title: string
    year: number
    medium: string
    width: number
    height: number
    depth: number | null
    slug: string
    description: string
  }
  artistName: string
  certNumber: string
  imageUrl: string
}

export default function CertificateClient({
  artwork,
  artistName,
  certNumber,
  imageUrl
}: CertificateClientProps) {
  const date = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  return (
    <>
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        @page { size: A4; margin: 0; }
      `}</style>

      {/* Bouton d'impression */}
      <div className="no-print fixed top-4 right-4 flex gap-4 z-50">
        <button
          onClick={() => window.print()}
          className="bg-black text-white px-6 py-3 text-sm hover:bg-neutral-800 transition-colors"
        >
          Imprimer / Sauvegarder PDF
        </button>
        <a
          href="/"
          className="border border-neutral-300 bg-white px-6 py-3 text-sm hover:bg-neutral-100 transition-colors"
        >
          Retour au site
        </a>
      </div>

      {/* Certificat */}
      <div 
        className="w-full max-w-[210mm] min-h-screen mx-auto bg-white text-black p-8 md:p-16"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {/* En-tête */}
        <div className="text-center border-b-2 border-black pb-8 mb-12">
          <h1 className="text-3xl md:text-4xl tracking-[0.5em] font-light mb-2">ELFAKIR</h1>
          <p className="text-xs md:text-sm tracking-[0.3em] text-neutral-600">GALERIE D'ART CONTEMPORAIN</p>
        </div>

        {/* Titre */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-light tracking-wide mb-4">
            Certificat d'Authenticité
          </h2>
          <p className="text-neutral-500">N° {certNumber}</p>
        </div>

        {/* Image de l'œuvre */}
        {imageUrl && (
          <div className="flex justify-center mb-12">
            <img
              src={imageUrl}
              alt={artwork.title}
              className="max-h-48 md:max-h-64 object-contain border border-neutral-200"
            />
          </div>
        )}

        {/* Informations de l'œuvre */}
        <div className="mb-12">
          <p className="text-center text-sm text-neutral-500 mb-8">
            Ce document certifie que l'œuvre décrite ci-dessous est une création originale et authentique.
          </p>

          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-600">Titre</span>
              <span className="font-medium text-right">{artwork.title}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-600">Artiste</span>
              <span className="font-medium">{artistName}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-600">Année</span>
              <span className="font-medium">{artwork.year}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-600">Technique</span>
              <span className="font-medium text-right">{artwork.medium}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-600">Dimensions</span>
              <span className="font-medium">
                {artwork.width} × {artwork.height}
                {artwork.depth ? ` × ${artwork.depth}` : ""} cm
              </span>
            </div>
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-600">Référence</span>
              <span className="font-medium">{artwork.slug}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-12 text-center">
          <p className="text-sm text-neutral-600 italic max-w-lg mx-auto">
            "{artwork.description.substring(0, 200)}{artwork.description.length > 200 ? "..." : ""}"
          </p>
        </div>

        {/* Signature */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <p className="text-sm text-neutral-500 mb-2">Date d'émission</p>
              <p className="font-medium">{date}</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-b border-black mb-2" />
              <p className="text-sm text-neutral-600">Signature & cachet de la galerie</p>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-neutral-200 text-center text-xs text-neutral-400">
          <p>ELFAKIR - Galerie d'Art Contemporain</p>
          <p className="mt-1">galeryelfakir.vercel.app</p>
          <p className="mt-4 max-w-md mx-auto">
            Ce certificat atteste de l'authenticité de l'œuvre et fait partie intégrante de celle-ci.
            Il ne peut être ni reproduit ni transféré sans l'œuvre originale.
          </p>
        </div>
      </div>
    </>
  )
}
