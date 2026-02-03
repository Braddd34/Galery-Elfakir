import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export const metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et protection des données de la galerie ELFAKIR",
}

export default function ConfidentialitePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white pt-28">
        {/* Hero */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
              Politique de confidentialité
            </h1>
            <p className="text-neutral-400">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 pb-24">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Introduction */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                Introduction
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  La galerie ELFAKIR s'engage à protéger la vie privée des utilisateurs 
                  de son site internet. Cette politique de confidentialité explique comment 
                  nous collectons, utilisons et protégeons vos données personnelles.
                </p>
                <p>
                  En utilisant notre site, vous acceptez les pratiques décrites dans 
                  cette politique de confidentialité.
                </p>
              </div>
            </div>

            {/* Responsable du traitement */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                1. Responsable du traitement
              </h2>
              <div className="space-y-2 text-neutral-400">
                <p>Le responsable du traitement des données est :</p>
                <ul className="space-y-2 list-none">
                  <li><strong className="text-neutral-300">Société :</strong> ELFAKIR</li>
                  <li><strong className="text-neutral-300">Adresse :</strong> [À compléter]</li>
                  <li><strong className="text-neutral-300">Email :</strong> contact@elfakir.art</li>
                </ul>
              </div>
            </div>

            {/* Données collectées */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                2. Données collectées
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>Nous collectons les types de données suivants :</p>
                
                <h3 className="text-lg text-white mt-6 mb-3">Données d'identification</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone (optionnel)</li>
                  <li>Adresse postale (pour la livraison)</li>
                </ul>

                <h3 className="text-lg text-white mt-6 mb-3">Données de connexion</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Adresse IP</li>
                  <li>Type de navigateur</li>
                  <li>Pages visitées</li>
                  <li>Date et heure de connexion</li>
                </ul>

                <h3 className="text-lg text-white mt-6 mb-3">Données de transaction</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Historique des commandes</li>
                  <li>Informations de paiement (traitées par notre prestataire Stripe)</li>
                </ul>
              </div>
            </div>

            {/* Finalités */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                3. Finalités du traitement
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>Vos données sont collectées pour les finalités suivantes :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Gestion de votre compte utilisateur</li>
                  <li>Traitement et suivi de vos commandes</li>
                  <li>Livraison des œuvres</li>
                  <li>Gestion du service client</li>
                  <li>Envoi d'informations sur nos nouvelles œuvres (avec votre consentement)</li>
                  <li>Amélioration de nos services</li>
                  <li>Respect de nos obligations légales</li>
                </ul>
              </div>
            </div>

            {/* Base légale */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                4. Base légale du traitement
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>Le traitement de vos données repose sur :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-neutral-300">L'exécution du contrat :</strong> pour le traitement des commandes</li>
                  <li><strong className="text-neutral-300">Le consentement :</strong> pour l'envoi de newsletters</li>
                  <li><strong className="text-neutral-300">L'intérêt légitime :</strong> pour l'amélioration de nos services</li>
                  <li><strong className="text-neutral-300">L'obligation légale :</strong> pour la conservation des factures</li>
                </ul>
              </div>
            </div>

            {/* Durée de conservation */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                5. Durée de conservation
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>Vos données sont conservées pendant les durées suivantes :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-neutral-300">Données de compte :</strong> pendant la durée de votre inscription, puis 3 ans après la dernière activité</li>
                  <li><strong className="text-neutral-300">Données de commande :</strong> 10 ans (obligations comptables)</li>
                  <li><strong className="text-neutral-300">Données de connexion :</strong> 1 an</li>
                  <li><strong className="text-neutral-300">Cookies :</strong> 13 mois maximum</li>
                </ul>
              </div>
            </div>

            {/* Destinataires */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                6. Destinataires des données
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>Vos données peuvent être partagées avec :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Notre équipe interne (service client, logistique)</li>
                  <li>Nos prestataires de paiement (Stripe)</li>
                  <li>Nos transporteurs partenaires</li>
                  <li>Notre hébergeur (Vercel)</li>
                </ul>
                <p>
                  Nous ne vendons jamais vos données personnelles à des tiers.
                </p>
              </div>
            </div>

            {/* Transferts internationaux */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                7. Transferts internationaux
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Certains de nos prestataires sont situés en dehors de l'Union européenne 
                  (notamment aux États-Unis). Dans ce cas, nous nous assurons que des 
                  garanties appropriées sont mises en place (clauses contractuelles types, 
                  certifications) pour protéger vos données.
                </p>
              </div>
            </div>

            {/* Vos droits */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                8. Vos droits
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-neutral-300">Droit d'accès :</strong> obtenir une copie de vos données</li>
                  <li><strong className="text-neutral-300">Droit de rectification :</strong> corriger vos données inexactes</li>
                  <li><strong className="text-neutral-300">Droit à l'effacement :</strong> demander la suppression de vos données</li>
                  <li><strong className="text-neutral-300">Droit à la limitation :</strong> restreindre le traitement de vos données</li>
                  <li><strong className="text-neutral-300">Droit à la portabilité :</strong> récupérer vos données dans un format lisible</li>
                  <li><strong className="text-neutral-300">Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                  <li><strong className="text-neutral-300">Droit de retirer votre consentement :</strong> à tout moment pour les traitements basés sur le consentement</li>
                </ul>
                <p className="mt-4">
                  Pour exercer ces droits, contactez-nous à : 
                  <strong className="text-white"> contact@elfakir.art</strong>
                </p>
                <p>
                  Vous pouvez également introduire une réclamation auprès de la CNIL 
                  (Commission Nationale de l'Informatique et des Libertés) : 
                  <a 
                    href="https://www.cnil.fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white underline hover:text-neutral-300"
                  >
                    www.cnil.fr
                  </a>
                </p>
              </div>
            </div>

            {/* Cookies */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                9. Cookies
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Notre site utilise des cookies pour améliorer votre expérience. 
                  Les cookies sont de petits fichiers texte stockés sur votre appareil.
                </p>
                
                <h3 className="text-lg text-white mt-6 mb-3">Types de cookies utilisés</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-neutral-300">Cookies essentiels :</strong> nécessaires au fonctionnement du site (session, authentification)</li>
                  <li><strong className="text-neutral-300">Cookies analytiques :</strong> pour comprendre comment vous utilisez notre site</li>
                </ul>

                <h3 className="text-lg text-white mt-6 mb-3">Gestion des cookies</h3>
                <p>
                  Vous pouvez configurer votre navigateur pour refuser les cookies. 
                  Notez que cela peut affecter certaines fonctionnalités du site.
                </p>
              </div>
            </div>

            {/* Sécurité */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                10. Sécurité des données
              </h2>
              <div className="space-y-4 text-neutral-400">
                <p>
                  Nous mettons en œuvre des mesures techniques et organisationnelles 
                  appropriées pour protéger vos données contre tout accès non autorisé, 
                  modification, divulgation ou destruction :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Chiffrement des données en transit (HTTPS)</li>
                  <li>Accès restreint aux données personnelles</li>
                  <li>Sauvegardes régulières</li>
                  <li>Mots de passe cryptés</li>
                </ul>
              </div>
            </div>

            {/* Modifications */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                11. Modifications de la politique
              </h2>
              <p className="text-neutral-400">
                Nous nous réservons le droit de modifier cette politique de confidentialité 
                à tout moment. Les modifications entrent en vigueur dès leur publication 
                sur le site. Nous vous encourageons à consulter régulièrement cette page.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-2xl font-light mb-6 pb-2 border-b border-neutral-800">
                12. Contact
              </h2>
              <div className="space-y-2 text-neutral-400">
                <p>
                  Pour toute question concernant cette politique de confidentialité 
                  ou vos données personnelles, contactez-nous :
                </p>
                <ul className="space-y-2 list-none mt-4">
                  <li><strong className="text-neutral-300">Email :</strong> contact@elfakir.art</li>
                  <li><strong className="text-neutral-300">Adresse :</strong> [À compléter]</li>
                </ul>
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
