import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold tracking-tight">
              ELFAKIR
            </Link>
            
            {/* Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/catalogue" className="text-sm text-gray-600 hover:text-black transition-colors">
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
            
            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-gray-600 hover:text-black transition-colors">
                Connexion
              </Link>
              <Link 
                href="/register" 
                className="bg-black text-white px-5 py-2.5 text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 py-32 md:py-40">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white/80">Nouvelles œuvres disponibles</span>
            </div>
            
            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              L'art accessible
              <br />
              <span className="text-gray-400">à tous</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-400 mb-10 max-w-xl">
              Découvrez des œuvres originales d'artistes internationaux. 
              Chaque pièce est unique et certifiée authentique.
            </p>
            
            {/* CTA */}
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/catalogue"
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 font-medium rounded-full hover:bg-gray-100 transition-colors"
              >
                Explorer le catalogue
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link 
                href="/artistes"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white px-8 py-4 font-medium rounded-full hover:bg-white/20 transition-colors border border-white/20"
              >
                Nos artistes
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-lg">
            <div>
              <div className="text-4xl font-bold text-white">150+</div>
              <div className="text-gray-500 mt-1">Œuvres</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">45</div>
              <div className="text-gray-500 mt-1">Artistes</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">12</div>
              <div className="text-gray-500 mt-1">Pays</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Sélection du moment</h2>
              <p className="text-gray-500">Une curation exclusive d'œuvres choisies</p>
            </div>
            <Link 
              href="/catalogue" 
              className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all"
            >
              Voir tout
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          
          {/* Artworks Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Harmonie Abstraite",
                artist: "Marie Dupont",
                price: "2 500 €",
                image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1000&fit=crop",
                category: "Peinture"
              },
              {
                title: "Nature Silencieuse",
                artist: "Jean Martin",
                price: "1 800 €",
                image: "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800&h=1000&fit=crop",
                category: "Peinture"
              },
              {
                title: "Lumière d'Été",
                artist: "Sophie Bernard",
                price: "3 200 €",
                image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=1000&fit=crop",
                category: "Photographie"
              },
            ].map((artwork) => (
              <Link 
                key={artwork.title}
                href={`/oeuvre/1`}
                className="group"
              >
                {/* Card */}
                <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-2">
                  {/* Image */}
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Category badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-3 py-1.5 rounded-full">
                        {artwork.category}
                      </span>
                    </div>
                    {/* Favorite button */}
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-1">{artwork.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">{artwork.artist}</p>
                    <p className="text-xl font-bold">{artwork.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pourquoi nous choisir ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Une expérience d'achat d'art sécurisée et transparente
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Authenticité garantie",
                description: "Chaque œuvre est accompagnée d'un certificat d'authenticité signé par l'artiste."
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "Paiement sécurisé",
                description: "Transactions cryptées via Stripe avec protection acheteur intégrée."
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                ),
                title: "Livraison mondiale",
                description: "Expédition professionnelle et assurée dans le monde entier."
              },
            ].map((feature) => (
              <div 
                key={feature.title}
                className="bg-gray-50 rounded-3xl p-8 border border-gray-100"
              >
                <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Artists */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl" />
            
            <div className="relative">
              <span className="inline-block text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">
                Pour les artistes
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Exposez vos œuvres au monde
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-8 text-lg">
                Rejoignez notre communauté d'artistes et touchez des collectionneurs internationaux. 
                Commission transparente, paiements directs.
              </p>
              <Link 
                href="/register?role=artist"
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors"
              >
                Devenir artiste partenaire
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="text-xl font-bold mb-4">ELFAKIR</div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Galerie d'art en ligne dédiée aux œuvres originales d'artistes internationaux.
              </p>
            </div>
            
            {/* Navigation */}
            <div>
              <div className="font-semibold mb-4">Navigation</div>
              <ul className="space-y-3">
                {['Catalogue', 'Artistes', 'À propos', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase()}`} className="text-sm text-gray-500 hover:text-black transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <div className="font-semibold mb-4">Légal</div>
              <ul className="space-y-3">
                {['Mentions légales', 'CGV', 'Confidentialité', 'Cookies'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-gray-500 hover:text-black transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <div className="font-semibold mb-4">Contact</div>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>contact@galerie-elfakir.com</li>
                <li>+33 1 23 45 67 89</li>
              </ul>
              {/* Social */}
              <div className="flex gap-4 mt-6">
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Bottom */}
          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Galerie ELFAKIR. Tous droits réservés.
            </p>
            <p className="text-sm text-gray-400">
              Fait avec ❤️ en France
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
