import Link from "next/link"

const artwork = {
  id: "1",
  title: "Harmonie Abstraite",
  artist: { name: "Marie Dupont", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200", bio: "Artiste contemporaine basée à Paris", artworksCount: 12 },
  price: 2500,
  images: [
    "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200",
    "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800",
    "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800",
  ],
  category: "Peinture",
  year: 2024,
  medium: "Huile sur toile",
  dimensions: { width: 100, height: 80 },
  description: "Cette œuvre explore les tensions entre forme et couleur, créant un dialogue visuel qui invite à la contemplation. Les couches successives de pigments créent une profondeur unique.",
}

export default function ArtworkPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold tracking-tight">ELFAKIR</Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/catalogue" className="text-sm text-gray-600 hover:text-black">Catalogue</Link>
              <Link href="/artistes" className="text-sm text-gray-600 hover:text-black">Artistes</Link>
              <Link href="/a-propos" className="text-sm text-gray-600 hover:text-black">À propos</Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-black">Contact</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-gray-600 hover:text-black">Connexion</Link>
              <Link href="/register" className="bg-black text-white px-5 py-2.5 text-sm font-medium rounded-full">S'inscrire</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-black">Accueil</Link>
            <span className="text-gray-300">/</span>
            <Link href="/catalogue" className="text-gray-500 hover:text-black">Catalogue</Link>
            <span className="text-gray-300">/</span>
            <span className="text-black font-medium">{artwork.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
              <div className="aspect-[4/5]">
                <img src={artwork.images[0]} alt={artwork.title} className="w-full h-full object-cover" />
              </div>
            </div>
            
            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-4">
              {artwork.images.map((img, i) => (
                <button
                  key={i}
                  className={`bg-white rounded-xl overflow-hidden border-2 aspect-square transition-all ${
                    i === 0 ? "border-black" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex gap-2 mb-4">
                <span className="bg-gray-100 text-sm font-medium px-4 py-2 rounded-full">{artwork.category}</span>
                <span className="bg-gray-100 text-sm font-medium px-4 py-2 rounded-full">{artwork.year}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{artwork.title}</h1>
              <p className="text-gray-500 text-lg">{artwork.medium}</p>
            </div>

            {/* Artist Card */}
            <Link href={`/artiste/${artwork.artist.name}`} className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
              <img src={artwork.artist.image} alt={artwork.artist.name} className="w-16 h-16 rounded-full object-cover" />
              <div className="flex-1">
                <div className="font-semibold text-lg">{artwork.artist.name}</div>
                <div className="text-gray-500 text-sm">{artwork.artist.artworksCount} œuvres</div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Description */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <h2 className="font-semibold text-lg mb-3">À propos de l'œuvre</h2>
              <p className="text-gray-600 leading-relaxed">{artwork.description}</p>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
              <div className="flex justify-between items-center p-5">
                <span className="text-gray-500">Dimensions</span>
                <span className="font-medium">{artwork.dimensions.width} × {artwork.dimensions.height} cm</span>
              </div>
              <div className="flex justify-between items-center p-5">
                <span className="text-gray-500">Technique</span>
                <span className="font-medium">{artwork.medium}</span>
              </div>
              <div className="flex justify-between items-center p-5">
                <span className="text-gray-500">Année</span>
                <span className="font-medium">{artwork.year}</span>
              </div>
              <div className="flex justify-between items-center p-5">
                <span className="text-gray-500">Certificat</span>
                <span className="flex items-center gap-2 font-medium text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Inclus
                </span>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 sticky top-24">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-gray-500 text-sm">Prix</span>
                  <div className="text-4xl font-bold">{artwork.price.toLocaleString('fr-FR')} €</div>
                </div>
                <span className="text-gray-400 text-sm">TVA incluse</span>
              </div>
              
              <button className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors mb-3">
                Acheter maintenant
              </button>
              
              <button className="w-full bg-gray-100 py-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Ajouter aux favoris
              </button>
              
              <p className="text-center text-gray-500 text-sm mt-4">
                🚚 Livraison mondiale assurée
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Galerie ELFAKIR</p>
        </div>
      </footer>
    </div>
  )
}
