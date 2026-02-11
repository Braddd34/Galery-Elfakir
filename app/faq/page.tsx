import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ — Questions fréquentes",
  description: "Trouvez les réponses à vos questions sur l'achat d'œuvres d'art, la livraison, les retours et la galerie ELFAKIR.",
}

const faqs = [
  {
    category: "Achat",
    questions: [
      {
        q: "Comment acheter une œuvre ?",
        a: "Parcourez notre catalogue, cliquez sur l'œuvre qui vous plaît, puis ajoutez-la à votre panier. Vous serez guidé à travers le processus de commande avec le choix de l'adresse de livraison et le paiement sécurisé."
      },
      {
        q: "Les prix sont-ils négociables ?",
        a: "Les prix affichés sont fixes. Cependant, vous pouvez contacter directement l'artiste via notre messagerie interne pour discuter d'éventuelles commandes personnalisées."
      },
      {
        q: "Puis-je payer en plusieurs fois ?",
        a: "Pour le moment, nous ne proposons pas le paiement en plusieurs fois. Le paiement se fait en une seule fois par carte bancaire via notre plateforme sécurisée."
      },
      {
        q: "Les prix incluent-ils la TVA ?",
        a: "Oui, tous les prix affichés incluent la TVA. Les frais de livraison sont calculés séparément lors du processus de commande."
      }
    ]
  },
  {
    category: "Authenticité",
    questions: [
      {
        q: "Les œuvres sont-elles authentiques ?",
        a: "Absolument. Chaque œuvre vendue sur ELFAKIR est une création originale accompagnée d'un certificat d'authenticité signé, garantissant son origine et son unicité."
      },
      {
        q: "Qu'est-ce que le certificat d'authenticité ?",
        a: "C'est un document officiel qui accompagne chaque œuvre vendue. Il contient les informations sur l'œuvre (titre, dimensions, technique), l'artiste, et un numéro unique. Vous pouvez le télécharger depuis votre espace client."
      },
      {
        q: "Comment vérifier l'authenticité d'une œuvre ?",
        a: "Chaque certificat possède un numéro unique vérifiable. Si vous avez des doutes, contactez-nous avec le numéro de votre certificat et nous confirmerons son authenticité."
      }
    ]
  },
  {
    category: "Livraison",
    questions: [
      {
        q: "Quels sont les délais de livraison ?",
        a: "Les œuvres sont expédiées sous 3 à 5 jours ouvrés après confirmation du paiement. La livraison prend ensuite 2 à 5 jours en France, et 5 à 15 jours à l'international."
      },
      {
        q: "Comment sont emballées les œuvres ?",
        a: "Chaque œuvre est soigneusement emballée avec des matériaux professionnels : papier de soie, mousse de protection, carton renforcé et caisse en bois pour les sculptures. L'assurance transport est incluse."
      },
      {
        q: "Livrez-vous à l'international ?",
        a: "Oui, nous livrons dans le monde entier. Les frais de port varient selon la destination : France (25€), Europe (45€), International (80€). La livraison est offerte à partir de 5 000€ d'achat."
      },
      {
        q: "Puis-je suivre ma commande ?",
        a: "Oui, dès que votre commande est expédiée, vous recevez un email avec le numéro de suivi et le nom du transporteur. Vous pouvez également suivre votre commande depuis votre espace client."
      }
    ]
  },
  {
    category: "Retours",
    questions: [
      {
        q: "Puis-je retourner une œuvre ?",
        a: "Vous disposez d'un droit de rétractation de 14 jours après réception. L'œuvre doit être retournée dans son emballage d'origine, en parfait état. Les frais de retour sont à la charge de l'acheteur."
      },
      {
        q: "Comment effectuer un retour ?",
        a: "Contactez-nous via le formulaire de contact ou la messagerie interne en indiquant votre numéro de commande. Nous vous enverrons les instructions de retour et l'adresse d'expédition."
      },
      {
        q: "Quand serai-je remboursé ?",
        a: "Le remboursement est effectué sous 14 jours après réception et vérification de l'œuvre retournée, sur le moyen de paiement utilisé lors de l'achat."
      }
    ]
  },
  {
    category: "Artistes",
    questions: [
      {
        q: "Comment devenir artiste partenaire ?",
        a: "Inscrivez-vous en tant qu'artiste sur notre site. Votre profil sera examiné par notre équipe curatoriale. Si votre travail correspond à notre ligne artistique, nous activerons votre compte et vous pourrez commencer à publier vos œuvres."
      },
      {
        q: "Quelle est la commission de la galerie ?",
        a: "La commission standard est de 30% sur le prix de vente. Cela couvre les frais de plateforme, de promotion, et le support client. L'artiste reçoit 70% du prix de vente."
      },
      {
        q: "Comment suis-je payé en tant qu'artiste ?",
        a: "Les paiements sont transférés directement sur votre compte bancaire après chaque vente. Vous pouvez suivre vos ventes et revenus depuis votre tableau de bord artiste."
      }
    ]
  },
  {
    category: "Compte",
    questions: [
      {
        q: "Comment créer un compte ?",
        a: "Cliquez sur 'Connexion' puis 'Créer un compte'. Remplissez le formulaire avec votre nom, email et mot de passe. Vous recevrez un email de vérification pour activer votre compte."
      },
      {
        q: "J'ai oublié mon mot de passe",
        a: "Sur la page de connexion, cliquez sur 'Mot de passe oublié ?'. Entrez votre email et nous vous enverrons un lien de réinitialisation valable 1 heure."
      },
      {
        q: "Comment modifier mes informations ?",
        a: "Connectez-vous à votre compte, allez dans 'Mon profil' depuis le tableau de bord. Vous pourrez y modifier vos informations personnelles, votre adresse et vos préférences."
      }
    ]
  }
]

export default function FAQPage() {
  // Données structurées FAQPage pour Google (rich snippets dans les résultats de recherche)
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.flatMap(cat =>
      cat.questions.map(q => ({
        "@type": "Question",
        name: q.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: q.a
        }
      }))
    )
  }
  return (
    <>
      {/* JSON-LD pour les rich snippets FAQ de Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-black text-white pt-28">
        {/* Hero */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="label text-gold mb-4">Aide</p>
            <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-6">
              Questions fréquentes
            </h1>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Trouvez rapidement les réponses à vos questions sur l'achat d'œuvres, 
              la livraison, l'authenticité et bien plus.
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="px-6 pb-24">
          <div className="max-w-4xl mx-auto space-y-16">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-2xl font-light mb-8 flex items-center gap-4">
                  <span className="w-8 h-px bg-gold" />
                  {section.category}
                </h2>
                <div className="space-y-6">
                  {section.questions.map((faq, i) => (
                    <details 
                      key={i} 
                      className="group border border-neutral-800 bg-neutral-900/30"
                    >
                      <summary className="px-6 py-5 cursor-pointer list-none flex items-center justify-between hover:bg-neutral-900/50 transition-colors">
                        <span className="font-light pr-4">{faq.q}</span>
                        <svg 
                          className="w-5 h-5 text-neutral-500 flex-shrink-0 transition-transform group-open:rotate-45"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </summary>
                      <div className="px-6 pb-6 pt-2">
                        <p className="text-neutral-400 leading-relaxed">{faq.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Contact */}
        <section className="border-t border-neutral-800 py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-light mb-4">Vous n'avez pas trouvé votre réponse ?</h2>
            <p className="text-neutral-500 mb-8">
              Notre équipe est disponible pour répondre à toutes vos questions.
            </p>
            <a 
              href="/contact" 
              className="inline-block px-8 py-4 border border-white text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
            >
              Nous contacter
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
