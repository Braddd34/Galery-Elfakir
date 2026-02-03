import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export const metadata = {
  title: "À propos",
  description: "Découvrez l'histoire et la mission de la galerie ELFAKIR",
}

export default function AProposPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white pt-28">
        {/* Hero */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
              À propos
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl">
              Une galerie d'art contemporain dédiée à l'excellence 
              et à la découverte de talents émergents.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Image */}
              <div className="aspect-[4/5] bg-neutral-900 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1577720643272-265f09367456?w=800"
                  alt="Galerie ELFAKIR"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text */}
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl md:text-4xl font-light mb-8">
                  Notre Mission
                </h2>
                <div className="space-y-6 text-neutral-400">
                  <p>
                    Fondée avec la passion de l'art contemporain, la galerie ELFAKIR 
                    s'engage à promouvoir des artistes talentueux du monde entier et 
                    à rendre l'art accessible à tous les collectionneurs.
                  </p>
                  <p>
                    Chaque œuvre présentée dans notre galerie est soigneusement 
                    sélectionnée pour sa qualité artistique, son originalité et 
                    son authenticité. Nous travaillons en étroite collaboration 
                    avec nos artistes pour garantir une expérience unique.
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

        {/* Values */}
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
                <p className="text-neutral-500 text-sm">
                  Chaque œuvre est unique et accompagnée d'un certificat 
                  d'authenticité vérifié.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 border border-neutral-700 flex items-center justify-center">
                  <span className="text-2xl">◆</span>
                </div>
                <h3 className="text-xl font-light mb-4">Excellence</h3>
                <p className="text-neutral-500 text-sm">
                  Une sélection rigoureuse d'artistes et d'œuvres 
                  pour garantir la plus haute qualité.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 border border-neutral-700 flex items-center justify-center">
                  <span className="text-2xl">◇</span>
                </div>
                <h3 className="text-xl font-light mb-4">Transparence</h3>
                <p className="text-neutral-500 text-sm">
                  Des prix justes et une communication claire 
                  avec nos artistes et collectionneurs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
