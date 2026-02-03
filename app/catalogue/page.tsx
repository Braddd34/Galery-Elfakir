import Link from "next/link"

// Données mockées pour la démo (seront remplacées par la base de données)
const mockArtworks = [
  {
    id: "1",
    title: "Harmonie Abstraite",
    artist: "Marie Dupont",
    price: 2500,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
    category: "Peinture",
  },
  {
    id: "2",
    title: "Nature Morte Moderne",
    artist: "Jean Martin",
    price: 1800,
    image: "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800",
    category: "Peinture",
  },
  {
    id: "3",
    title: "Sculpture Contemporaine",
    artist: "Sophie Bernard",
    price: 4500,
    image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800",
    category: "Sculpture",
  },
  {
    id: "4",
    title: "Portrait Expressionniste",
    artist: "Lucas Moreau",
    price: 3200,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
    category: "Peinture",
  },
  {
    id: "5",
    title: "Paysage Urbain",
    artist: "Emma Leroy",
    price: 2100,
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800",
    category: "Photographie",
  },
  {
    id: "6",
    title: "Composition Géométrique",
    artist: "Pierre Dubois",
    price: 1950,
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800",
    category: "Peinture",
  },
]

export default function CataloguePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            ELFAKIR
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/catalogue" className="text-sm font-medium">
              Catalogue
            </Link>
            <Link href="/artistes" className="text-sm hover:text-gray-600 transition">
              Artistes
            </Link>
            <Link href="/a-propos" className="text-sm hover:text-gray-600 transition">
              À propos
            </Link>
            <Link href="/contact" className="text-sm hover:text-gray-600 transition">
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm hover:text-gray-600 transition">
              Connexion
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="pt-32 pb-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Catalogue</h1>
          <p className="text-xl text-gray-600">
            Découvrez notre sélection d'œuvres originales
          </p>
        </div>
      </header>

      {/* Filters */}
      <section className="border-y bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-sm font-medium">Filtrer par :</span>
            <button className="px-4 py-2 bg-black text-white text-sm rounded-md">
              Tous
            </button>
            <button className="px-4 py-2 bg-white border text-sm rounded-md hover:bg-gray-100 transition">
              Peinture
            </button>
            <button className="px-4 py-2 bg-white border text-sm rounded-md hover:bg-gray-100 transition">
              Sculpture
            </button>
            <button className="px-4 py-2 bg-white border text-sm rounded-md hover:bg-gray-100 transition">
              Photographie
            </button>
            <button className="px-4 py-2 bg-white border text-sm rounded-md hover:bg-gray-100 transition">
              Dessin
            </button>
          </div>
        </div>
      </section>

      {/* Artworks Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockArtworks.map((artwork) => (
              <Link 
                key={artwork.id} 
                href={`/oeuvre/${artwork.id}`}
                className="group artwork-card"
              >
                <div className="aspect-[4/5] relative overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white px-3 py-1 text-xs font-medium rounded-full">
                      {artwork.category}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold group-hover:text-gray-600 transition">
                    {artwork.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{artwork.artist}</p>
                  <p className="text-lg font-bold mt-2">
                    {artwork.price.toLocaleString('fr-FR')} €
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Galerie ELFAKIR. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
