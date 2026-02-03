import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-black border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="text-2xl tracking-[0.3em] font-light">
              ELFAKIR
            </Link>
            <p className="mt-4 text-neutral-500 text-sm leading-relaxed max-w-md">
              Galerie d'art contemporain dédiée à la promotion d'artistes 
              émergents et établis. Chaque œuvre est unique et accompagnée 
              d'un certificat d'authenticité.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 mb-4">
              Navigation
            </h4>
            <nav className="flex flex-col gap-3">
              <Link href="/catalogue" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Catalogue
              </Link>
              <Link href="/artistes" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Artistes
              </Link>
              <Link href="/a-propos" className="text-neutral-400 hover:text-white transition-colors text-sm">
                À propos
              </Link>
              <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 mb-4">
              Légal
            </h4>
            <nav className="flex flex-col gap-3">
              <Link href="/mentions-legales" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Mentions légales
              </Link>
              <Link href="/cgv" className="text-neutral-400 hover:text-white transition-colors text-sm">
                CGV
              </Link>
              <Link href="/confidentialite" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Confidentialité
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-600 text-sm">
            © {new Date().getFullYear()} ELFAKIR. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-neutral-500 hover:text-white transition-colors text-sm">
              Instagram
            </a>
            <a href="#" className="text-neutral-500 hover:text-white transition-colors text-sm">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
