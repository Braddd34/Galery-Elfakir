import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] noise">
      {/* Gradient Background */}
      <div className="fixed inset-0 gradient-mesh opacity-60 pointer-events-none" />
      
      {/* Navigation - Glass Effect */}
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
                  className="bg-black text-white px-4 py-2 text-sm rounded-full hover:bg-gray-800 transition-all duration-200 hover:scale-105"
                >
                  Commencer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-24 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">Nouvelles œuvres disponibles</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight mb-6 animate-fade-in-up text-balance">
            L'art à portée
            <br />
            <span className="text-gradient">de main</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-1 text-pretty">
            Découvrez des œuvres originales d'artistes internationaux. 
            Chaque pièce est unique et certifiée authentique.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-2">
            <Link 
              href="/catalogue"
              className="group inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 text-base font-medium rounded-full hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Explorer le catalogue
              <svg 
                className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link 
              href="/artistes"
              className="inline-flex items-center justify-center gap-2 glass px-8 py-4 text-base font-medium rounded-full hover:bg-white/80 transition-all duration-300"
            >
              Découvrir les artistes
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto animate-fade-in-up stagger-3">
            {[
              { value: '150+', label: 'Œuvres' },
              { value: '45', label: 'Artistes' },
              { value: '12', label: 'Pays' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-semibold">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
              Sélection du moment
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Une curation exclusive d'œuvres choisies par notre équipe
            </p>
          </div>
          
          {/* Featured Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Harmonie Abstraite",
                artist: "Marie Dupont",
                price: "2 500 €",
                image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1000&fit=crop",
              },
              {
                title: "Nature Silencieuse",
                artist: "Jean Martin",
                price: "1 800 €",
                image: "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=800&h=1000&fit=crop",
              },
              {
                title: "Lumière d'Été",
                artist: "Sophie Bernard",
                price: "3 200 €",
                image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=1000&fit=crop",
              },
            ].map((artwork, index) => (
              <Link 
                key={artwork.title}
                href={`/oeuvre/${index + 1}`}
                className="group glass rounded-3xl overflow-hidden hover-lift"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Quick view button */}
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <div className="glass-dark text-white text-sm py-3 px-4 rounded-xl text-center">
                      Voir l'œuvre
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-medium text-lg mb-1 group-hover:text-gray-600 transition-colors">
                    {artwork.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">{artwork.artist}</p>
                  <p className="font-semibold">{artwork.price}</p>
                </div>
              </Link>
            ))}
          </div>
          
          {/* View All Link */}
          <div className="text-center mt-12">
            <Link 
              href="/catalogue"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
            >
              Voir toutes les œuvres
              <svg 
                className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Authenticité garantie",
                description: "Chaque œuvre est accompagnée d'un certificat d'authenticité signé par l'artiste.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "Paiement sécurisé",
                description: "Transactions cryptées via Stripe avec protection acheteur intégrée.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                ),
                title: "Livraison mondiale",
                description: "Expédition professionnelle et assurée dans le monde entier.",
              },
            ].map((feature) => (
              <div 
                key={feature.title}
                className="glass rounded-3xl p-8 hover-lift"
              >
                <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artist CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-[2rem] p-12 md:p-16 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-100 to-transparent rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-gray-100 to-transparent rounded-full blur-3xl opacity-60" />
            
            <div className="relative">
              <span className="inline-block text-sm font-medium text-gray-500 mb-4">
                Pour les artistes
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
                Exposez vos œuvres
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto mb-8">
                Rejoignez notre communauté d'artistes et touchez des collectionneurs du monde entier. 
                Commission transparente, paiements directs.
              </p>
              <Link 
                href="/register?role=artist"
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all duration-300 hover:scale-105"
              >
                Devenir artiste partenaire
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="text-xl font-semibold mb-4">ELFAKIR</div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Galerie d'art en ligne dédiée aux œuvres originales d'artistes internationaux.
              </p>
            </div>
            
            {/* Navigation */}
            <div>
              <div className="text-sm font-medium mb-4">Navigation</div>
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
              <div className="text-sm font-medium mb-4">Légal</div>
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
              <div className="text-sm font-medium mb-4">Contact</div>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>contact@galerie-elfakir.com</li>
                <li>+33 1 23 45 67 89</li>
              </ul>
            </div>
          </div>
          
          {/* Bottom */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-200/50">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Galerie ELFAKIR. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <Link href="#" className="text-gray-400 hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
