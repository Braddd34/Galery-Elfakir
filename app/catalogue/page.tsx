import Link from "next/link"

const artworks = [
  { id: "1", title: "Harmonie Abstraite", artist: "Marie Dupont", price: 2500, year: 2024, image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1000&fit=crop", category: "Peinture" },
  { id: "2", title: "Nature Silencieuse", artist: "Jean Martin", price: 1800, year: 2023, image: "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800&h=1000&fit=crop", category: "Peinture" },
  { id: "3", title: "Sculpture Organique", artist: "Sophie Bernard", price: 4500, year: 2024, image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&h=1000&fit=crop", category: "Sculpture" },
  { id: "4", title: "Portrait Moderne", artist: "Lucas Moreau", price: 3200, year: 2024, image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=1000&fit=crop", category: "Peinture" },
  { id: "5", title: "Lumière Urbaine", artist: "Emma Leroy", price: 2100, year: 2023, image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=1000&fit=crop", category: "Photographie" },
  { id: "6", title: "Géométrie Pure", artist: "Pierre Dubois", price: 1950, year: 2024, image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=1000&fit=crop", category: "Peinture" },
  { id: "7", title: "Essence Marine", artist: "Claire Fontaine", price: 2800, year: 2024, image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=1000&fit=crop", category: "Peinture" },
  { id: "8", title: "Fragments", artist: "Antoine Roux", price: 3500, year: 2023, image: "https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=800&h=1000&fit=crop", category: "Technique mixte" },
]

const categories = ["Tout", "Peinture", "Sculpture", "Photographie", "Technique mixte"]

export default function CataloguePage() {
  return (
    <main className="bg-black text-white min-h-screen">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-neutral-800/50">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl tracking-[0.3em] font-light">
              ELFAKIR
            </Link>
            
            <div className="hidden md:flex items-center gap-12">
              <Link href="/catalogue" className="text-sm tracking-[0.15em] uppercase text-gold">
                Collection
              </Link>
              <Link href="/artistes" className="text-sm tracking-[0.15em] uppercase hover:opacity-60 transition-opacity">
                Artistes
              </Link>
              <Link href="/a-propos" className="text-sm tracking-[0.15em] uppercase hover:opacity-60 transition-opacity">
                À propos
              </Link>
            </div>
            
            <Link href="/contact" className="text-sm tracking-[0.15em] uppercase hover:opacity-60 transition-opacity">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="pt-40 pb-20 border-b border-neutral-800">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <p className="label mb-4 text-gold">Notre collection</p>
              <h1 className="heading-xl">Œuvres</h1>
            </div>
            <p className="text-neutral-500 max-w-md">
              Une sélection minutieuse d'œuvres originales, 
              choisies pour leur qualité artistique exceptionnelle.
            </p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-neutral-800 sticky top-[73px] bg-black z-40">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16 py-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {categories.map((category, index) => (
                <button
                  key={category}
                  className={`px-6 py-3 text-sm tracking-[0.1em] uppercase transition-all border ${
                    index === 0
                      ? "bg-white text-black border-white"
                      : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Count */}
            <p className="text-neutral-500 text-sm">
              {artworks.length} œuvres
            </p>
          </div>
        </div>
      </div>

      {/* Artworks Grid */}
      <section className="py-20">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {artworks.map((artwork, index) => (
              <Link 
                key={artwork.id} 
                href={`/oeuvre/${artwork.id}`}
                className="group"
              >
                {/* Image */}
                <div className="relative img-zoom aspect-[3/4] bg-neutral-900 mb-6">
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />
                  
                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-sm tracking-[0.2em] uppercase border border-white px-8 py-4 bg-black/50 backdrop-blur">
                      Voir l'œuvre
                    </span>
                  </div>
                </div>
                
                {/* Info */}
                <div className="space-y-2">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">
                    {artwork.category} — {artwork.year}
                  </p>
                  <h3 className="text-lg font-light group-hover:text-gold transition-colors duration-300">
                    {artwork.title}
                  </h3>
                  <p className="text-neutral-500 text-sm">{artwork.artist}</p>
                  <p className="text-lg pt-2">€{artwork.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Load More */}
      <div className="pb-32 text-center">
        <button className="border border-neutral-700 px-16 py-5 text-sm tracking-[0.15em] uppercase hover:border-white hover:bg-white hover:text-black transition-all duration-300">
          Charger plus
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-12">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-neutral-600 text-sm">
            © 2024 Galerie ELFAKIR
          </p>
          <div className="flex gap-8 text-sm text-neutral-600">
            <Link href="#" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="#" className="hover:text-white transition-colors">CGV</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
