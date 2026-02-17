import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { getServerTranslation } from "@/lib/i18n-server"

export const metadata: Metadata = {
  title: "À propos",
  description: "Découvrez l'histoire, la mission et les valeurs de la galerie ELFAKIR. Une galerie d'art contemporain dédiée à la promotion d'artistes émergents et établis.",
  openGraph: {
    title: "À propos — ELFAKIR",
    description: "Découvrez l'histoire, la mission et les valeurs de la galerie ELFAKIR.",
  },
}

export default function AProposPage() {
  const t = getServerTranslation()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white pt-28">
        {/* Hero */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <p className="label text-gold mb-4">{t("about.ourHistory")}</p>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
              {t("about.title")}
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl">
              {t("about.heroSubtitle")}
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16">
              <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1577720643272-265f09367456?w=800"
                  alt="Intérieur de la galerie ELFAKIR"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl md:text-4xl font-light mb-8">
                  {t("about.ourMission")}
                </h2>
                <div className="space-y-6 text-neutral-400 leading-relaxed">
                  <p>{t("about.missionP1")}</p>
                  <p>{t("about.missionP2")}</p>
                  <p>{t("about.missionP3")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chiffres clés */}
        <section className="border-t border-b border-neutral-800 py-20 px-6 bg-neutral-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl md:text-5xl font-light mb-2">500+</p>
                <p className="text-neutral-500 text-sm uppercase tracking-wider">{t("about.stat1")}</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-light mb-2">50+</p>
                <p className="text-neutral-500 text-sm uppercase tracking-wider">{t("about.stat2")}</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-light mb-2">15+</p>
                <p className="text-neutral-500 text-sm uppercase tracking-wider">{t("about.stat3")}</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-light mb-2">100%</p>
                <p className="text-neutral-500 text-sm uppercase tracking-wider">{t("about.stat4")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Notre approche */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light mb-4 text-center">
              {t("about.ourApproach")}
            </h2>
            <p className="text-neutral-500 text-center max-w-2xl mx-auto mb-16">
              {t("about.approachSubtitle")}
            </p>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { num: 1, title: t("about.step1Title"), desc: t("about.step1Desc") },
                { num: 2, title: t("about.step2Title"), desc: t("about.step2Desc") },
                { num: 3, title: t("about.step3Title"), desc: t("about.step3Desc") },
                { num: 4, title: t("about.step4Title"), desc: t("about.step4Desc") },
              ].map((step) => (
                <div key={step.num} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 border border-neutral-700 flex items-center justify-center text-gold text-2xl font-light">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-light mb-3">{step.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Valeurs */}
        <section className="border-t border-neutral-800 py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light mb-16 text-center">
              {t("about.ourValues")}
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { icon: "✦", title: t("about.valueAuthenticity"), desc: t("about.valueAuthenticityLong") },
                { icon: "◆", title: t("about.valueExcellence"), desc: t("about.valueExcellenceDesc") },
                { icon: "◇", title: t("about.valueTransparency"), desc: t("about.valueTransparencyLong") },
              ].map((value) => (
                <div key={value.title} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 border border-neutral-700 flex items-center justify-center">
                    <span className="text-2xl">{value.icon}</span>
                  </div>
                  <h3 className="text-xl font-light mb-4">{value.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pour les artistes */}
        <section className="border-t border-neutral-800 py-24 px-6 bg-neutral-900/20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="label text-gold mb-4">{t("about.forArtistsLabel")}</p>
                <h2 className="text-3xl md:text-4xl font-light mb-6">
                  {t("about.joinTitle")}
                </h2>
                <div className="space-y-4 text-neutral-400 leading-relaxed">
                  <p>{t("about.joinP1")}</p>
                  <p>{t("about.joinP2")}</p>
                </div>
                <div className="mt-8 flex gap-4 flex-wrap">
                  <Link 
                    href="/register"
                    className="inline-block px-8 py-4 bg-white text-black text-sm uppercase tracking-wider hover:bg-gold transition-colors"
                  >
                    {t("about.becomeArtist")}
                  </Link>
                  <Link 
                    href="/faq"
                    className="inline-block px-8 py-4 border border-neutral-700 text-sm uppercase tracking-wider hover:border-white transition-colors"
                  >
                    {t("about.learnMore")}
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative aspect-square bg-neutral-900 overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400" 
                    alt="Artiste peignant" 
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
                <div className="relative aspect-square bg-neutral-900 overflow-hidden mt-8">
                  <Image 
                    src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400" 
                    alt="Atelier d'artiste" 
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-neutral-800 py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              {t("about.question")}
            </h2>
            <p className="text-neutral-500 mb-8 max-w-lg mx-auto">
              {t("about.questionDesc")}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link 
                href="/contact" 
                className="inline-block px-8 py-4 border border-white text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
              >
                {t("about.contactUs")}
              </Link>
              <Link 
                href="/catalogue" 
                className="inline-block px-8 py-4 border border-neutral-700 text-sm uppercase tracking-wider hover:border-white transition-colors"
              >
                {t("about.viewCatalogue")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
