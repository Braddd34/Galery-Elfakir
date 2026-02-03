import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            ELFAKIR
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/catalogue" className="text-sm hover:text-gray-600 transition">
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
            <Link 
              href="/login" 
              className="text-sm hover:text-gray-600 transition"
            >
              Connexion
            </Link>
            <Link 
              href="/register" 
              className="bg-black text-white px-4 py-2 text-sm rounded-md hover:bg-gray-800 transition"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center justify-center text-white pt-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Galerie ELFAKIR
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Découvrez des œuvres d'art originales d'artistes internationaux.
            Chaque pièce est unique et accompagnée d'un certificat d'authenticité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/catalogue"
              className="bg-white text-black px-8 py-4 text-lg font-medium rounded-md hover:bg-gray-100 transition"
            >
              Découvrir le catalogue
            </Link>
            <Link 
              href="/artistes"
              className="border border-white px-8 py-4 text-lg font-medium rounded-md hover:bg-white/10 transition"
            >
              Nos artistes
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Pourquoi choisir notre galerie ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Œuvres authentiques</h3>
              <p className="text-gray-600">
                Chaque œuvre est accompagnée d'un certificat d'authenticité signé par l'artiste.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Paiement sécurisé</h3>
              <p className="text-gray-600">
                Transactions sécurisées par Stripe avec protection acheteur garantie.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Livraison mondiale</h3>
              <p className="text-gray-600">
                Expédition soignée et assurée partout dans le monde.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Vous êtes artiste ?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Rejoignez notre galerie et exposez vos œuvres à des collectionneurs du monde entier.
          </p>
          <Link 
            href="/register?role=artist"
            className="bg-black text-white px-8 py-4 text-lg font-medium rounded-md hover:bg-gray-800 transition inline-block"
          >
            Devenir artiste partenaire
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold mb-4">ELFAKIR</h3>
              <p className="text-gray-400">
                Galerie d'art en ligne dédiée aux œuvres originales d'artistes internationaux.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/catalogue" className="hover:text-white transition">Catalogue</Link></li>
                <li><Link href="/artistes" className="hover:text-white transition">Artistes</Link></li>
                <li><Link href="/a-propos" className="hover:text-white transition">À propos</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Informations légales</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/mentions-legales" className="hover:text-white transition">Mentions légales</Link></li>
                <li><Link href="/cgv" className="hover:text-white transition">CGV</Link></li>
                <li><Link href="/confidentialite" className="hover:text-white transition">Politique de confidentialité</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition">Cookies</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>contact@galerie-elfakir.com</li>
                <li>+33 1 23 45 67 89</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Galerie ELFAKIR. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
