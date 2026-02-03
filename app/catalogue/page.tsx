import Link from "next/link"

const artworks = [
  { id: "1", title: "Harmonie Abstraite", artist: "Marie Dupont", price: 2500, image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=750&fit=crop", category: "Peinture" },
  { id: "2", title: "Nature Silencieuse", artist: "Jean Martin", price: 1800, image: "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=600&h=750&fit=crop", category: "Peinture" },
  { id: "3", title: "Sculpture Organique", artist: "Sophie Bernard", price: 4500, image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600&h=750&fit=crop", category: "Sculpture" },
  { id: "4", title: "Portrait Moderne", artist: "Lucas Moreau", price: 3200, image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=750&fit=crop", category: "Peinture" },
  { id: "5", title: "Lumière Urbaine", artist: "Emma Leroy", price: 2100, image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&h=750&fit=crop", category: "Photographie" },
  { id: "6", title: "Géométrie Pure", artist: "Pierre Dubois", price: 1950, image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&h=750&fit=crop", category: "Peinture" },
  { id: "7", title: "Essence Marine", artist: "Claire Fontaine", price: 2800, image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=750&fit=crop", category: "Peinture" },
  { id: "8", title: "Fragments", artist: "Antoine Roux", price: 3500, image: "https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=600&h=750&fit=crop", category: "Technique mixte" },
]

const categories = ["Tous", "Peinture", "Sculpture", "Photographie", "Dessin"]

export default function CataloguePage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold tracking-tight">
              ELFAKIR
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="/catalogue" className="text-sm font-medium text-black">
                Catalogue
              </Link>
              <Link href="/artistes" className="text-sm text-gray-600 hover:text-black transition-colors">
                Artistes
              </Link>
              <Link href="/a-propos" className="text-sm text-gray-600 hover:text-black transition-colors">
                À propos
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-black transition-colors">
                Contact
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-gray-600 hover:text-black transition-colors">
                Connexion
              </Link>
              <Link href="/register" className="bg-black text-white px-5 py-2.5 text-sm font-medium rounded-full hover:bg-gray-800 transition-colors">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Catalogue</h1>
          <p className="text-gray-500 text-lg">{artworks.length} œuvres disponibles</p>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="sticky top-[73px] z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-5 py-2.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                    category === "Tous"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Search & Sort */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-64 pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Sort Dropdown */}
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Trier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Artworks Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artworks.map((artwork) => (
            <Link key={artwork.id} href={`/oeuvre/${artwork.id}`} className="group">
              {/* Card */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-3 py-1.5 rounded-full">
                    {artwork.category}
                  </span>
                  
                  {/* Favorite */}
                  <button 
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110"
                    onClick={(e) => e.preventDefault()}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                
                {/* Info */}
                <div className="p-5">
                  <h3 className="font-semibold text-base mb-1 truncate">{artwork.title}</h3>
                  <p className="text-gray-500 text-sm mb-3">{artwork.artist}</p>
                  <p className="text-lg font-bold">{artwork.price.toLocaleString('fr-FR')} €</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-16">
          <button className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors">
            Charger plus d'œuvres
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Galerie ELFAKIR
          </p>
          <div className="flex items-center gap-6">
            <Link href="/mentions-legales" className="text-sm text-gray-400 hover:text-black transition-colors">
              Mentions légales
            </Link>
            <Link href="/cgv" className="text-sm text-gray-400 hover:text-black transition-colors">
              CGV
            </Link>
            <Link href="/contact" className="text-sm text-gray-400 hover:text-black transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
