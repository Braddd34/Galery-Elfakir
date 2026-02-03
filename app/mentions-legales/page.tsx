import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export const metadata = {
  title: "Mentions légales",
  description: "Mentions légales de la galerie ELFAKIR",
}

export default function MentionsLegalesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white pt-28">
        {/* Hero */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
              Mentions légales
            </h1>
            <p className="text-neutral-400">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 pb-24">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Éditeur du site */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                1. Éditeur du site
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Le site <strong className="text-white">galeryelkafir.vercel.app</strong> est édité par :
                </p>
                <ul className="space-y-2 list-none">
                  <li><strong className="text-neutral-300">Raison sociale :</strong> ELFAKIR</li>
                  <li><strong className="text-neutral-300">Forme juridique :</strong> [À compléter - Ex: SARL, SAS, Auto-entrepreneur]</li>
                  <li><strong className="text-neutral-300">Capital social :</strong> [À compléter]</li>
                  <li><strong className="text-neutral-300">Siège social :</strong> [Adresse à compléter]</li>
                  <li><strong className="text-neutral-300">SIRET :</strong> [Numéro à compléter]</li>
                  <li><strong className="text-neutral-300">RCS :</strong> [Numéro à compléter]</li>
                  <li><strong className="text-neutral-300">Numéro de TVA :</strong> [À compléter si applicable]</li>
                  <li><strong className="text-neutral-300">Email :</strong> contact@elfakir.art</li>
                  <li><strong className="text-neutral-300">Téléphone :</strong> [À compléter]</li>
                </ul>
              </div>
            </div>

            {/* Directeur de publication */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                2. Directeur de la publication
              </h2>
              <p className="text-neutral-400">
                Le directeur de la publication est : <strong className="text-white">[Nom du responsable à compléter]</strong>
              </p>
            </div>

            {/* Hébergeur */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                3. Hébergement
              </h2>
              <div className="space-y-2 text-neutral-400">
                <p>Le site est hébergé par :</p>
                <ul className="space-y-2 list-none">
                  <li><strong className="text-neutral-300">Société :</strong> Vercel Inc.</li>
                  <li><strong className="text-neutral-300">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
                  <li><strong className="text-neutral-300">Site web :</strong> vercel.com</li>
                </ul>
              </div>
            </div>

            {/* Propriété intellectuelle */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                4. Propriété intellectuelle
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, sons, 
                  logiciels, etc.) est la propriété exclusive de ELFAKIR ou de ses partenaires 
                  et est protégé par les lois françaises et internationales relatives à la 
                  propriété intellectuelle.
                </p>
                <p>
                  Les œuvres d'art présentées sur ce site sont la propriété de leurs auteurs 
                  respectifs. Toute reproduction, représentation, modification, publication, 
                  adaptation de tout ou partie des éléments du site, quel que soit le moyen 
                  ou le procédé utilisé, est interdite sans l'autorisation écrite préalable 
                  de ELFAKIR et/ou des artistes concernés.
                </p>
                <p>
                  Toute exploitation non autorisée du site ou de l'un quelconque des éléments 
                  qu'il contient sera considérée comme constitutive d'une contrefaçon et 
                  poursuivie conformément aux dispositions des articles L.335-2 et suivants 
                  du Code de Propriété Intellectuelle.
                </p>
              </div>
            </div>

            {/* Données personnelles */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                5. Protection des données personnelles
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Conformément au Règlement Général sur la Protection des Données (RGPD) 
                  et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, 
                  de rectification, de suppression et d'opposition aux données personnelles 
                  vous concernant.
                </p>
                <p>
                  Pour plus d'informations sur la gestion de vos données personnelles, 
                  veuillez consulter notre{" "}
                  <a href="/confidentialite" className="text-white underline hover:text-neutral-300">
                    Politique de confidentialité
                  </a>.
                </p>
                <p>
                  Pour exercer vos droits, vous pouvez nous contacter à l'adresse : 
                  <strong className="text-white"> contact@elfakir.art</strong>
                </p>
              </div>
            </div>

            {/* Cookies */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                6. Cookies
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Le site utilise des cookies pour améliorer l'expérience utilisateur 
                  et réaliser des statistiques de visites. En poursuivant votre navigation 
                  sur ce site, vous acceptez l'utilisation de cookies.
                </p>
                <p>
                  Vous pouvez à tout moment désactiver les cookies dans les paramètres 
                  de votre navigateur, ce qui peut toutefois altérer votre expérience 
                  sur le site.
                </p>
              </div>
            </div>

            {/* Limitation de responsabilité */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                7. Limitation de responsabilité
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  ELFAKIR s'efforce de fournir sur ce site des informations aussi précises 
                  que possible. Toutefois, elle ne pourra être tenue responsable des omissions, 
                  des inexactitudes et des carences dans la mise à jour, qu'elles soient de 
                  son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
                </p>
                <p>
                  Toutes les informations indiquées sur le site sont données à titre indicatif 
                  et sont susceptibles d'évoluer. Les photographies des œuvres sont non contractuelles 
                  et peuvent présenter de légères variations par rapport aux œuvres réelles 
                  (couleurs, dimensions exactes).
                </p>
              </div>
            </div>

            {/* Droit applicable */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                8. Droit applicable
              </h2>
              <p className="text-neutral-400">
                Les présentes mentions légales sont soumises au droit français. 
                En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
