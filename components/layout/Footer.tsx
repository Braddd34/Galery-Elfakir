import Link from "next/link"
import NewsletterForm from "@/components/ui/NewsletterForm"
import { getServerTranslation } from "@/lib/i18n-server"

export default function Footer() {
  const t = getServerTranslation()

  return (
    <footer className="bg-black border-t border-neutral-800">
      {/* Newsletter Section */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-light mb-2">{t("home.newsletterTitle")}</h3>
              <p className="text-neutral-500 text-sm">
                {t("home.newsletterDesc")}
              </p>
            </div>
            <div className="md:w-1/2 lg:w-1/3">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>
      
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
                {t("catalogue.title")}
              </Link>
              <Link href="/artistes" className="text-neutral-400 hover:text-white transition-colors text-sm">
                {t("nav.artists")}
              </Link>
              <Link href="/a-propos" className="text-neutral-400 hover:text-white transition-colors text-sm">
                {t("footer.aboutUs")}
              </Link>
              <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors text-sm">
                {t("footer.contact")}
              </Link>
              <Link href="/faq" className="text-neutral-400 hover:text-white transition-colors text-sm">
                {t("footer.faq")}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 mb-4">
              {t("footer.legal")}
            </h4>
            <nav className="flex flex-col gap-3">
              <Link href="/mentions-legales" className="text-neutral-400 hover:text-white transition-colors text-sm">
                {t("footer.legal")}
              </Link>
              <Link href="/cgv" className="text-neutral-400 hover:text-white transition-colors text-sm">
                {t("footer.terms")}
              </Link>
              <Link href="/confidentialite" className="text-neutral-400 hover:text-white transition-colors text-sm">
                {t("footer.privacy")}
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-600 text-sm">
              © {new Date().getFullYear()} ELFAKIR. {t("footer.rights")}.
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
