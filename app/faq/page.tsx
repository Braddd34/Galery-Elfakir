import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Metadata } from "next"
import { getServerTranslation } from "@/lib/i18n-server"

export const metadata: Metadata = {
  title: "FAQ — Questions fréquentes",
  description: "Trouvez les réponses à vos questions sur l'achat d'œuvres d'art, la livraison, les retours et la galerie ELFAKIR.",
}

function buildFaqs(t: (key: string) => string) {
  return [
    { category: t("faq.catPurchase"), questions: [
      { q: t("faq.q1"), a: t("faq.a1") },
      { q: t("faq.q2"), a: t("faq.a2") },
      { q: t("faq.q3"), a: t("faq.a3") },
      { q: t("faq.q4"), a: t("faq.a4") },
    ]},
    { category: t("faq.catAuthenticity"), questions: [
      { q: t("faq.q5"), a: t("faq.a5") },
      { q: t("faq.q6"), a: t("faq.a6") },
      { q: t("faq.q7"), a: t("faq.a7") },
    ]},
    { category: t("faq.catShipping"), questions: [
      { q: t("faq.q8"), a: t("faq.a8") },
      { q: t("faq.q9"), a: t("faq.a9") },
      { q: t("faq.q10"), a: t("faq.a10") },
      { q: t("faq.q11"), a: t("faq.a11") },
    ]},
    { category: t("faq.catReturns"), questions: [
      { q: t("faq.q12"), a: t("faq.a12") },
      { q: t("faq.q13"), a: t("faq.a13") },
      { q: t("faq.q14"), a: t("faq.a14") },
    ]},
    { category: t("faq.catArtists"), questions: [
      { q: t("faq.q15"), a: t("faq.a15") },
      { q: t("faq.q16"), a: t("faq.a16") },
      { q: t("faq.q17"), a: t("faq.a17") },
    ]},
    { category: t("faq.catAccount"), questions: [
      { q: t("faq.q18"), a: t("faq.a18") },
      { q: t("faq.q19"), a: t("faq.a19") },
      { q: t("faq.q20"), a: t("faq.a20") },
    ]},
  ]
}

export default function FAQPage() {
  const t = getServerTranslation()
  const faqs = buildFaqs(t)
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
            <p className="label text-gold mb-4">{t("faq.label")}</p>
            <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-6">
              {t("faq.title")}
            </h1>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              {t("faq.desc")}
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
            <h2 className="text-2xl font-light mb-4">{t("faq.noAnswer")}</h2>
            <p className="text-neutral-500 mb-8">
              {t("faq.noAnswerDesc")}
            </p>
            <a 
              href="/contact" 
              className="inline-block px-8 py-4 border border-white text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
            >
              {t("about.contactUs")}
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
