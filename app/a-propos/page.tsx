import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "À propos",
  description: "Découvrez l'histoire, la mission et les valeurs de la galerie ELFAKIR. Une galerie d'art contemporain dédiée à la promotion d'artistes émergents et établis.",
  openGraph: {
    title: "À propos — ELFAKIR",
    description: "Découvrez l'histoire, la mission et les valeurs de la galerie ELFAKIR.",
  },
}

/**
 * Page "À propos" complète.
 * Présente l'histoire de la galerie, sa mission, ses valeurs,
 * son processus de travail, des chiffres clés et l'équipe.
 */
export default function AProposPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white pt-28">
        {/* Hero */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <p className="label text-gold mb-4">Notre histoire</p>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
              À propos
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl">
              Une galerie d'art contemporain dédiée à l'excellence 
              et à la découverte de talents émergents du monde entier.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Image */}
              <div className="aspect-[4/5] bg-neutral-900 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1577720643272-265f09367456?w=800"
                  alt="Intérieur de la galerie ELFAKIR"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text */}
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl md:text-4xl font-light mb-8">
                  Notre Mission
                </h2>
                <div className="space-y-6 text-neutral-400 leading-relaxed">
                  <p>
                    Fondée avec la passion de l'art contemporain, la galerie ELFAKIR 
                    s'engage à promouvoir des artistes talentueux du monde entier et 
                    à rendre l'art accessible à tous les collectionneurs, qu'ils soient 
                    amateurs ou confirmés.
                  </p>
                  <p>
                    Chaque œuvre présentée dans notre galerie est soigneusement 
                    sélectionnée par notre comité curatorial pour sa qualité artistique, 
                    son originalité et son authenticité. Nous travaillons en étroite 
                    collaboration avec nos artistes pour garantir une expérience unique.
                  </p>
                  <p>
                    Notre engagement envers l'authenticité se traduit par un 
                    certificat d'authenticité fourni avec chaque œuvre vendue, 
                    garantissant l'origine et l'unicité de votre acquisition.
                  </p>
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
                <p className="text-neutral-500 text-sm uppercase tracking-wider">Œuvres présentées</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-light mb-2">50+</p>
                <p className="text-neutral-500 text-sm uppercase tracking-wider">Artistes partenaires</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-light mb-2">15+</p>
                <p className="text-neutral-500 text-sm uppercase tracking-wider">Pays représentés</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-light mb-2">100%</p>
                <p className="text-neutral-500 text-sm uppercase tracking-wider">Œuvres authentiques</p>
              </div>
            </div>
          </div>
        </section>

        {/* Notre approche */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light mb-4 text-center">
              Notre approche
            </h2>
            <p className="text-neutral-500 text-center max-w-2xl mx-auto mb-16">
              Un processus rigoureux pour garantir la qualité et l'authenticité de chaque œuvre.
            </p>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 border border-neutral-700 flex items-center justify-center text-gold text-2xl font-light">
                  1
                </div>
                <h3 className="text-lg font-light mb-3">Sélection</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Chaque artiste est évalué par notre comité curatorial sur la qualité de son travail, 
                  sa démarche artistique et son originalité.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 border border-neutral-700 flex items-center justify-center text-gold text-2xl font-light">
                  2
                </div>
                <h3 className="text-lg font-light mb-3">Vérification</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Chaque œuvre est vérifiée et photographiée en haute résolution. 
                  Un certificat d'authenticité est généré pour chaque pièce.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 border border-neutral-700 flex items-center justify-center text-gold text-2xl font-light">
                  3
                </div>
                <h3 className="text-lg font-light mb-3">Publication</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  L'œuvre est mise en ligne avec une description détaillée, ses dimensions, 
                  sa technique et des images haute qualité.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 border border-neutral-700 flex items-center justify-center text-gold text-2xl font-light">
                  4
                </div>
                <h3 className="text-lg font-light mb-3">Livraison</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Emballage professionnel, assurance transport et suivi de colis. 
                  Votre œuvre arrive en toute sécurité chez vous.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Valeurs */}
        <section className="border-t border-neutral-800 py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light mb-16 text-center">
              Nos Valeurs
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 border border-neutral-700 flex items-center justify-center">
                  <span className="text-2xl">✦</span>
                </div>
                <h3 className="text-xl font-light mb-4">Authenticité</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Chaque œuvre est unique et accompagnée d'un certificat 
                  d'authenticité vérifié et numéroté. Nous garantissons 
                  l'origine de chaque pièce.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 border border-neutral-700 flex items-center justify-center">
                  <span className="text-2xl">◆</span>
                </div>
                <h3 className="text-xl font-light mb-4">Excellence</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Une sélection rigoureuse d'artistes et d'œuvres 
                  pour garantir la plus haute qualité. Chaque détail 
                  compte, de la création à la livraison.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 border border-neutral-700 flex items-center justify-center">
                  <span className="text-2xl">◇</span>
                </div>
                <h3 className="text-xl font-light mb-4">Transparence</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Des prix justes et une communication claire 
                  avec nos artistes et collectionneurs. Pas de frais cachés, 
                  pas de surprises.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pour les artistes */}
        <section className="border-t border-neutral-800 py-24 px-6 bg-neutral-900/20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="label text-gold mb-4">Pour les artistes</p>
                <h2 className="text-3xl md:text-4xl font-light mb-6">
                  Rejoignez notre communauté
                </h2>
                <div className="space-y-4 text-neutral-400 leading-relaxed">
                  <p>
                    Vous êtes artiste et souhaitez exposer vos œuvres dans notre galerie ? 
                    Nous sommes toujours à la recherche de nouveaux talents.
                  </p>
                  <p>
                    En rejoignant ELFAKIR, vous bénéficiez d'une plateforme de vente professionnelle, 
                    d'un tableau de bord complet pour gérer vos œuvres et suivre vos ventes, 
                    et d'une visibilité auprès de collectionneurs du monde entier.
                  </p>
                </div>
                <div className="mt-8 flex gap-4 flex-wrap">
                  <Link 
                    href="/register"
                    className="inline-block px-8 py-4 bg-white text-black text-sm uppercase tracking-wider hover:bg-gold transition-colors"
                  >
                    Devenir artiste
                  </Link>
                  <Link 
                    href="/faq"
                    className="inline-block px-8 py-4 border border-neutral-700 text-sm uppercase tracking-wider hover:border-white transition-colors"
                  >
                    En savoir plus
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-neutral-900 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400" 
                    alt="Artiste peignant" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="aspect-square bg-neutral-900 overflow-hidden mt-8">
                  <img 
                    src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400" 
                    alt="Atelier d'artiste" 
                    className="w-full h-full object-cover" 
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
              Une question ?
            </h2>
            <p className="text-neutral-500 mb-8 max-w-lg mx-auto">
              N'hésitez pas à nous contacter pour toute question sur nos œuvres, 
              nos artistes ou notre galerie.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link 
                href="/contact" 
                className="inline-block px-8 py-4 border border-white text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
              >
                Nous contacter
              </Link>
              <Link 
                href="/catalogue" 
                className="inline-block px-8 py-4 border border-neutral-700 text-sm uppercase tracking-wider hover:border-white transition-colors"
              >
                Voir le catalogue
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
