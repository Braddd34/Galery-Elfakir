import Link from "next/link"

// Données mockées
const artwork = {
  id: "1",
  title: "Harmonie Abstraite",
  artist: {
    name: "Marie Dupont",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    bio: "Artiste contemporaine basée à Paris, spécialisée dans l'abstraction lyrique.",
    artworksCount: 12,
  },
  price: 2500,
  images: [
    "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=1500&fit=crop",
    "https://images.unsplash.com/photo-1549490349-8643362247b5?w=1200&h=1500&fit=crop",
    "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=1200&h=1500&fit=crop",
  ],
  category: "Peinture",
  year: 2024,
  medium: "Huile sur toile",
  dimensions: {
    width: 100,
    height: 80,
  },
  description: "Cette œuvre explore les tensions entre forme et couleur, créant un dialogue visuel qui invite à la contemplation. Les couches successives de pigments créent une profondeur unique, révélant de nouveaux détails à chaque observation.",
  certificate: true,
  shipping: "Livraison mondiale assurée",
}

export default function ArtworkDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-[#fafafa] noise">
      {/* Gradient Background */}
      <div className="fixed inset-0 gradient-mesh opacity-40 pointer-events-none" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50">
        <div className="mx-4 mt-4">
          <div className="glass rounded-2xl px-6 py-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-xl font-semibold tracking-tight">
                ELFAKIR
              </Link>
              
              <div className="hidden md:flex items-center gap-1">
                {['Catalogue', 'Artistes', 'À propos', 'Contact'].map((item) => (
                  <Link
                    key={item}
                    href={`/${item.toLowerCase().replace('à ', '')}`}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-black/5 rounded-lg transition-all duration-200"
                  >
                    {item}
                  </Link>
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="bg-black text-white px-4 py-2 text-sm rounded-full hover:bg-gray-800 transition-all duration-200"
                >
                  Commencer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="pt-28 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-black transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/catalogue" className="hover:text-black transition-colors">Catalogue</Link>
            <span>/</span>
            <span className="text-black">{artwork.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="glass rounded-3xl overflow-hidden">
                <div className="aspect-[4/5] relative">
                  <img
                    src={artwork.images[0]}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Thumbnails */}
              <div className="grid grid-cols-3 gap-4">
                {artwork.images.map((image, index) => (
                  <button
                    key={index}
                    className={`glass rounded-xl overflow-hidden aspect-square ${
                      index === 0 ? 'ring-2 ring-black ring-offset-2' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${artwork.title} - Vue ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Info Section */}
            <div className="lg:sticky lg:top-32 lg:self-start space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="glass text-xs px-3 py-1.5 rounded-full">
                    {artwork.category}
                  </span>
                  <span className="glass text-xs px-3 py-1.5 rounded-full">
                    {artwork.year}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
                  {artwork.title}
                </h1>
                <p className="text-gray-500">{artwork.medium}</p>
              </div>

              {/* Artist */}
              <Link 
                href={`/artiste/${artwork.artist.name.toLowerCase().replace(' ', '-')}`}
                className="glass rounded-2xl p-5 flex items-center gap-4 hover-lift"
              >
                <img
                  src={artwork.artist.image}
                  alt={artwork.artist.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-medium">{artwork.artist.name}</div>
                  <div className="text-sm text-gray-500">{artwork.artist.artworksCount} œuvres</div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Description */}
              <div>
                <h2 className="font-medium mb-3">À propos de l'œuvre</h2>
                <p className="text-gray-600 leading-relaxed">
                  {artwork.description}
                </p>
              </div>

              {/* Details */}
              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Dimensions</span>
                  <span className="font-medium">{artwork.dimensions.width} × {artwork.dimensions.height} cm</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Technique</span>
                  <span className="font-medium">{artwork.medium}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Année</span>
                  <span className="font-medium">{artwork.year}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Certificat</span>
                  <span className="flex items-center gap-2 font-medium text-green-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Inclus
                  </span>
                </div>
              </div>

              {/* Price & Buy */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-sm text-gray-500">Prix</span>
                    <div className="text-3xl font-semibold">
                      {artwork.price.toLocaleString('fr-FR')} €
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">TVA incluse</span>
                </div>
                
                <button className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] mb-3">
                  Acheter maintenant
                </button>
                
                <button className="w-full glass py-4 rounded-xl font-medium hover:bg-white/80 transition-all duration-300 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Ajouter aux favoris
                </button>
              </div>

              {/* Shipping Info */}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                {artwork.shipping}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Related Section */}
      <section className="py-16 px-4 border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8">Du même artiste</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Link 
                key={i}
                href={`/oeuvre/${i + 10}`}
                className="group"
              >
                <div className="glass rounded-2xl overflow-hidden hover-lift">
                  <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                    <img
                      src={`https://images.unsplash.com/photo-${1540000000000 + i * 1000000}?w=400&h=500&fit=crop`}
                      alt={`Œuvre ${i}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium truncate">Œuvre {i}</h3>
                    <p className="text-sm text-gray-500">{artwork.artist.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Galerie ELFAKIR. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
