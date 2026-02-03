import Link from "next/link"

// Données mockées (seront remplacées par la base de données)
const artworks = [
  {
    id: "1",
    title: "Harmonie Abstraite",
    artist: "Marie Dupont",
    price: 2500,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1000&fit=crop",
    category: "Peinture",
    year: 2024,
  },
  {
    id: "2",
    title: "Nature Silencieuse",
    artist: "Jean Martin",
    price: 1800,
    image: "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800&h=1000&fit=crop",
    category: "Peinture",
    year: 2023,
  },
  {
    id: "3",
    title: "Sculpture Organique",
    artist: "Sophie Bernard",
    price: 4500,
    image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&h=1000&fit=crop",
    category: "Sculpture",
    year: 2024,
  },
  {
    id: "4",
    title: "Portrait Moderne",
    artist: "Lucas Moreau",
    price: 3200,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=1000&fit=crop",
    category: "Peinture",
    year: 2024,
  },
  {
    id: "5",
    title: "Lumière Urbaine",
    artist: "Emma Leroy",
    price: 2100,
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=1000&fit=crop",
    category: "Photographie",
    year: 2023,
  },
  {
    id: "6",
    title: "Géométrie Pure",
    artist: "Pierre Dubois",
    price: 1950,
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=1000&fit=crop",
    category: "Peinture",
    year: 2024,
  },
  {
    id: "7",
    title: "Essence Marine",
    artist: "Claire Fontaine",
    price: 2800,
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=1000&fit=crop",
    category: "Peinture",
    year: 2024,
  },
  {
    id: "8",
    title: "Fragments",
    artist: "Antoine Roux",
    price: 3500,
    image: "https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=800&h=1000&fit=crop",
    category: "Technique mixte",
    year: 2023,
  },
]

const categories = ["Tous", "Peinture", "Sculpture", "Photographie", "Dessin", "Technique mixte"]

export default function CataloguePage() {
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
                    className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                      item === 'Catalogue' 
                        ? 'bg-black text-white' 
                        : 'text-gray-600 hover:text-black hover:bg-black/5'
                    }`}
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

      {/* Header */}
      <header className="pt-32 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
                Catalogue
              </h1>
              <p className="text-gray-500">
                {artworks.length} œuvres disponibles
              </p>
            </div>
            
            {/* Search */}
            <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 w-full md:w-80">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Rechercher une œuvre, un artiste..."
                className="bg-transparent outline-none text-sm w-full placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="py-4 px-4 sticky top-24 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all duration-200 ${
                    category === 'Tous'
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:text-black hover:bg-black/5'
                  }`}
                >
                  {category}
                </button>
              ))}
              
              {/* Divider */}
              <div className="w-px h-6 bg-gray-200 mx-2" />
              
              {/* Sort */}
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-black/5 rounded-lg transition-all duration-200 whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Trier par
              </button>
              
              {/* Price Filter */}
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-black/5 rounded-lg transition-all duration-200 whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Prix
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Artworks Grid */}
      <section className="py-8 px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork, index) => (
              <Link 
                key={artwork.id}
                href={`/oeuvre/${artwork.id}`}
                className="group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="glass rounded-2xl overflow-hidden hover-lift">
                  {/* Image Container */}
                  <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="glass text-xs px-3 py-1.5 rounded-full">
                        {artwork.category}
                      </span>
                    </div>
                    
                    {/* Favorite Button */}
                    <button className="absolute top-3 right-3 w-9 h-9 glass rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-medium text-base mb-1 truncate group-hover:text-gray-600 transition-colors">
                      {artwork.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3">{artwork.artist}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {artwork.price.toLocaleString('fr-FR')} €
                      </span>
                      <span className="text-xs text-gray-400">{artwork.year}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Load More */}
          <div className="text-center mt-12">
            <button className="glass px-8 py-3 rounded-full text-sm font-medium hover:bg-white/80 transition-all duration-300 inline-flex items-center gap-2">
              Charger plus d'œuvres
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
        </div>
      </footer>
    </div>
  )
}
