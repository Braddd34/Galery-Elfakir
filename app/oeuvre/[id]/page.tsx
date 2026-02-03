import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

const artwork = {
  id: "1",
  title: "Harmonie Abstraite",
  artist: {
    name: "Marie Dupont",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    location: "Paris, France",
    bio: "Artiste contemporaine reconnue pour son exploration des formes abstraites et de la couleur.",
  },
  price: 2500,
  year: 2024,
  medium: "Huile sur toile",
  dimensions: { width: 100, height: 80, depth: 3 },
  images: [
    "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1400&h=1800&fit=crop",
    "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800",
    "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800",
  ],
  description: "Cette œuvre explore la tension entre forme et couleur, créant un dialogue visuel qui invite à la contemplation. Les couches successives de pigments révèlent une profondeur unique, évoquant à la fois le mouvement et la sérénité.",
  category: "Peinture",
  edition: "Œuvre unique",
}

export default function ArtworkPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Header />
      <main className="bg-black text-white min-h-screen pt-28">
        {/* Breadcrumb */}
        <div className="border-b border-neutral-800/50">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16 py-4">
            <nav className="flex items-center gap-3 text-sm text-neutral-500">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <span>/</span>
              <Link href="/catalogue" className="hover:text-white transition-colors">Collection</Link>
              <span>/</span>
              <span className="text-white">{artwork.title}</span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16">
            <div className="grid lg:grid-cols-12 gap-16">
              
              {/* Left: Images */}
              <div className="lg:col-span-7 space-y-4">
                {/* Main Image */}
                <div className="aspect-[4/5] bg-neutral-900">
                  <img 
                    src={artwork.images[0]} 
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Thumbnails */}
                <div className="grid grid-cols-3 gap-4">
                  {artwork.images.map((img, i) => (
                    <div 
                      key={i}
                      className={`aspect-square bg-neutral-900 cursor-pointer transition-opacity ${
                        i === 0 ? "ring-1 ring-white" : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Info */}
              <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start space-y-10">
                
                {/* Header */}
                <div>
                  <p className="label text-gold mb-4">{artwork.category} — {artwork.year}</p>
                  <h1 className="heading-md mb-2">{artwork.title}</h1>
                  <p className="text-neutral-500 text-lg">{artwork.medium}</p>
                </div>

                {/* Artist */}
                <Link 
                  href={`/artiste/${artwork.artist.name}`}
                  className="flex items-center gap-5 py-6 border-y border-neutral-800 group"
                >
                  <img 
                    src={artwork.artist.image} 
                    alt={artwork.artist.name}
                    className="w-16 h-16 object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-lg group-hover:text-gold transition-colors">{artwork.artist.name}</p>
                    <p className="text-neutral-500 text-sm">{artwork.artist.location}</p>
                  </div>
                  <svg className="w-5 h-5 text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Description */}
                <div>
                  <p className="label mb-4">À propos</p>
                  <p className="text-neutral-400 leading-relaxed">{artwork.description}</p>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <p className="label mb-4">Détails</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="py-4 border-b border-neutral-800">
                      <p className="text-neutral-500 mb-1">Dimensions</p>
                      <p>{artwork.dimensions.width} × {artwork.dimensions.height} × {artwork.dimensions.depth} cm</p>
                    </div>
                    <div className="py-4 border-b border-neutral-800">
                      <p className="text-neutral-500 mb-1">Année</p>
                      <p>{artwork.year}</p>
                    </div>
                    <div className="py-4 border-b border-neutral-800">
                      <p className="text-neutral-500 mb-1">Technique</p>
                      <p>{artwork.medium}</p>
                    </div>
                    <div className="py-4 border-b border-neutral-800">
                      <p className="text-neutral-500 mb-1">Édition</p>
                      <p>{artwork.edition}</p>
                    </div>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="bg-neutral-900/50 p-8 space-y-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-neutral-500 text-sm mb-1">Prix</p>
                      <p className="text-4xl font-light">€{artwork.price.toLocaleString()}</p>
                    </div>
                    <p className="text-neutral-500 text-sm">TVA incluse</p>
                  </div>
                  
                  <button className="w-full bg-white text-black py-5 text-sm tracking-[0.15em] uppercase font-medium hover:bg-gold hover:text-black transition-colors">
                    Acquérir cette œuvre
                  </button>
                  
                  <button className="w-full border border-neutral-700 py-5 text-sm tracking-[0.15em] uppercase hover:border-white transition-colors flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Sauvegarder
                  </button>
                  
                  <div className="flex items-center gap-3 pt-4 text-neutral-500 text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Certificat d'authenticité inclus</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-neutral-500 text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                    <span>Livraison mondiale assurée</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Works */}
        <section className="py-24 border-t border-neutral-800">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16">
            <div className="flex justify-between items-end mb-16">
              <div>
                <p className="label text-gold mb-4">Explorer</p>
                <h2 className="heading-sm">Œuvres similaires</h2>
              </div>
              <Link href="/catalogue" className="text-sm tracking-[0.15em] uppercase text-neutral-500 hover:text-white transition-colors">
                Voir tout
              </Link>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Link key={i} href={`/oeuvre/${i}`} className="group">
                  <div className="img-zoom aspect-[3/4] bg-neutral-900 mb-4">
                    <img 
                      src={`https://images.unsplash.com/photo-154${i}961017774-22349e4a1262?w=600&h=800&fit=crop`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-light group-hover:text-gold transition-colors">Œuvre {i}</h3>
                  <p className="text-neutral-500 text-sm">Artiste</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
