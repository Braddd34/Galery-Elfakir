"use client"

import Link from "next/link"
import NewsletterForm from "@/components/ui/NewsletterForm"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { SOCIAL_LINKS } from "@/lib/constants"

/**
 * Footer du site — composant client pour accéder aux traductions dynamiques.
 * Contient : newsletter, navigation, liens légaux, réseaux sociaux.
 */
export default function Footer() {
  const { t } = useLanguage()

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
              {t("footer.description")}
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
              <Link href="/blog" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Blog
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
            {SOCIAL_LINKS.instagram && (
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors text-sm">
                Instagram
              </a>
            )}
            {SOCIAL_LINKS.twitter && (
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors text-sm">
                Twitter
              </a>
            )}
            {SOCIAL_LINKS.tiktok && (
              <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors text-sm flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.49a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.51a8.27 8.27 0 004.76 1.5v-3.45a4.83 4.83 0 01-1-.13z"/>
                </svg>
                TikTok
              </a>
            )}
            {SOCIAL_LINKS.linkedin && (
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors text-sm">
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
