import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export const metadata = {
  title: "Conditions Générales de Vente",
  description: "Conditions Générales de Vente de la galerie ELFAKIR",
}

export default function CGVPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white pt-28">
        {/* Hero */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
              Conditions Générales de Vente
            </h1>
            <p className="text-neutral-400">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 pb-24">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Préambule */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                Préambule
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Les présentes Conditions Générales de Vente (CGV) régissent les ventes 
                  d'œuvres d'art réalisées par la galerie ELFAKIR via son site internet 
                  <strong className="text-white"> galeryelkafir.vercel.app</strong>.
                </p>
                <p>
                  Toute commande passée sur le site implique l'acceptation sans réserve 
                  des présentes CGV par l'acheteur.
                </p>
              </div>
            </div>

            {/* Article 1 - Objet */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                Article 1 - Objet
              </h2>
              <p className="text-neutral-400">
                Les présentes CGV ont pour objet de définir les droits et obligations 
                des parties dans le cadre de la vente en ligne d'œuvres d'art originales 
                proposées par la galerie ELFAKIR.
              </p>
            </div>

            {/* Article 2 - Produits */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                Article 2 - Produits
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Les œuvres proposées à la vente sont des créations originales d'artistes 
                  contemporains. Chaque œuvre est unique ou fait partie d'une édition limitée 
                  clairement mentionnée dans sa description.
                </p>
                <p>
                  Les photographies et descriptions des œuvres sont aussi fidèles que possible. 
                  Cependant, de légères variations peuvent exister entre la représentation 
                  photographique et l'œuvre réelle, notamment en ce qui concerne les couleurs.
                </p>
                <p>
                  Chaque œuvre vendue est accompagnée d'un <strong className="text-white">certificat 
                  d'authenticité</strong> signé par l'artiste et/ou la galerie.
                </p>
              </div>
            </div>

            {/* Article 3 - Prix */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                Article 3 - Prix
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Les prix sont indiqués en euros (€) toutes taxes comprises (TTC). 
                  Ils ne comprennent pas les frais de livraison, qui sont calculés 
                  séparément en fonction de la destination et des dimensions de l'œuvre.
                </p>
                <p>
                  ELFAKIR se réserve le droit de modifier ses prix à tout moment. 
                  Les œuvres seront facturées sur la base des tarifs en vigueur au moment 
                  de la validation de la commande.
                </p>
              </div>
            </div>

            {/* Article 4 - Commande */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                Article 4 - Commande
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Pour passer commande, l'acheteur doit :
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Sélectionner l'œuvre souhaitée</li>
                  <li>Créer un compte ou se connecter</li>
                  <li>Renseigner ses informations de livraison</li>
                  <li>Choisir le mode de livraison</li>
                  <li>Accepter les présentes CGV</li>
                  <li>Procéder au paiement</li>
                </ol>
                <p>
                  La commande est définitivement validée après réception du paiement intégral. 
                  Un email de confirmation est envoyé à l'acheteur.
                </p>
              </div>
            </div>

            {/* Article 5 - Paiement */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                Article 5 - Paiement
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Le paiement s'effectue en ligne par carte bancaire via une plateforme 
                  de paiement sécurisée (Stripe). Les données bancaires sont cryptées 
                  et ne sont jamais stockées par ELFAKIR.
                </p>
                <p>
                  Pour les œuvres d'un montant supérieur à 3 000 €, un paiement en plusieurs 
                  fois peut être proposé sur demande. Contactez-nous pour plus d'informations.
                </p>
              </div>
            </div>

            {/* Article 6 - Livraison */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                Article 6 - Livraison
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Les œuvres sont livrées à l'adresse indiquée par l'acheteur lors de la commande. 
                  Les délais de livraison sont donnés à titre indicatif et varient généralement 
                  entre 5 et 15 jours ouvrés selon la destination et les dimensions de l'œuvre.
                </p>
                <p>
                  Chaque œuvre est soigneusement emballée par des professionnels pour garantir 
                  son transport en toute sécurité. Les œuvres sont assurées pendant le transport.
                </p>
                <p>
                  En cas de dommage constaté à la réception, l'acheteur doit :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Émettre des réserves auprès du transporteur</li>
                  <li>Contacter ELFAKIR dans les 48 heures avec photos du dommage</li>
                </ul>
              </div>
            </div>

            {/* Article 7 - Droit de rétractation */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                Article 7 - Droit de rétractation
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Conformément à l'article L.221-18 du Code de la consommation, l'acheteur 
                  dispose d'un délai de <strong className="text-white">14 jours</strong> à compter 
                  de la réception de l'œuvre pour exercer son droit de rétractation, 
                  sans avoir à justifier de motifs ni à payer de pénalités.
                </p>
                <p>
                  Pour exercer ce droit, l'acheteur doit notifier sa décision par email 
                  à <strong className="text-white">contact@elfakir.art</strong> ou par courrier 
                  à l'adresse du siège social.
                </p>
                <p>
                  L'œuvre doit être retournée dans son emballage d'origine, en parfait état. 
                  Les frais de retour sont à la charge de l'acheteur. Le remboursement sera 
                  effectué dans les 14 jours suivant la réception de l'œuvre retournée.
                </p>
                <p className="text-neutral-500 text-sm">
                  Note : Le droit de rétractation ne s'applique pas aux œuvres personnalisées 
                  ou créées sur commande.
                </p>
              </div>
            </div>

            {/* Article 8 - Garanties */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                Article 8 - Garanties
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  ELFAKIR garantit l'authenticité de toutes les œuvres vendues. 
                  Cette garantie est matérialisée par le certificat d'authenticité 
                  fourni avec chaque œuvre.
                </p>
                <p>
                  En cas de doute sur l'authenticité d'une œuvre, l'acheteur peut 
                  contacter ELFAKIR qui s'engage à effectuer les vérifications nécessaires.
                </p>
              </div>
            </div>

            {/* Article 9 - Transfert de propriété */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                Article 9 - Transfert de propriété
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Le transfert de propriété de l'œuvre à l'acheteur n'intervient qu'après 
                  paiement complet du prix. Cependant, les risques de perte ou de détérioration 
                  de l'œuvre sont transférés à l'acheteur dès la livraison.
                </p>
                <p>
                  L'achat d'une œuvre confère à l'acheteur un droit de propriété sur le support 
                  matériel de l'œuvre. Les droits de reproduction et de représentation restent 
                  la propriété de l'artiste, sauf accord écrit contraire.
                </p>
              </div>
            </div>

            {/* Article 10 - Protection des données */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                Article 10 - Protection des données
              </h2>
              <p className="text-neutral-400">
                Les informations collectées lors de la commande sont nécessaires à son traitement 
                et sont traitées conformément à notre{" "}
                <a href="/confidentialite" className="text-white underline hover:text-neutral-300">
                  Politique de confidentialité
                </a>.
              </p>
            </div>

            {/* Article 11 - Service client */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                Article 11 - Service client
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Pour toute question ou réclamation, notre service client est disponible :
                </p>
                <ul className="space-y-2 list-none">
                  <li><strong className="text-neutral-300">Par email :</strong> contact@elfakir.art</li>
                  <li><strong className="text-neutral-300">Par courrier :</strong> [Adresse à compléter]</li>
                  <li><strong className="text-neutral-300">Horaires :</strong> Lundi au Vendredi, 9h-18h</li>
                </ul>
              </div>
            </div>

            {/* Article 12 - Médiation */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                Article 12 - Médiation
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  En cas de litige, l'acheteur peut recourir gratuitement au service de médiation 
                  suivant : [Nom du médiateur à compléter] - [Coordonnées à compléter]
                </p>
                <p>
                  L'acheteur peut également utiliser la plateforme européenne de règlement 
                  des litiges en ligne :{" "}
                  <a 
                    href="https://ec.europa.eu/consumers/odr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white underline hover:text-neutral-300"
                  >
                    https://ec.europa.eu/consumers/odr
                  </a>
                </p>
              </div>
            </div>

            {/* Article 13 - Droit applicable */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                Article 13 - Droit applicable
              </h2>
              <p className="text-neutral-400">
                Les présentes CGV sont soumises au droit français. En cas de litige, 
                et après tentative de résolution amiable, les tribunaux français seront 
                seuls compétents.
              </p>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
