import Link from "next/link"
import Image from "next/image"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import prisma from "@/lib/prisma"
import { Metadata } from "next"
import { getServerTranslation } from "@/lib/i18n-server"

export const metadata: Metadata = {
  title: "Expositions Virtuelles | Galerie ELFAKIR",
  description:
    "Parcourez nos expositions virtuelles 3D et découvrez des œuvres d'art dans un espace immersif. Galerie ELFAKIR - Art contemporain.",
  keywords: [
    "exposition virtuelle",
    "galerie 3D",
    "art contemporain",
    "visite virtuelle",
    "ELFAKIR",
  ],
  openGraph: {
    title: "Expositions Virtuelles | Galerie ELFAKIR",
    description:
      "Parcourez nos expositions virtuelles 3D et découvrez des œuvres d'art dans un espace immersif.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Expositions Virtuelles | Galerie ELFAKIR",
    description:
      "Parcourez nos expositions virtuelles 3D et découvrez des œuvres d'art dans un espace immersif.",
  },
}

function getImageUrl(images: unknown, index = 0): string {
  if (!images) return ""
  try {
    const parsed =
      typeof images === "string" ? JSON.parse(images) : (images as { url?: string }[])
    return parsed[index]?.url || ""
  } catch {
    return ""
  }
}

export default async function ExpositionsVirtuellesPage() {
  const t = getServerTranslation()

  const exhibitions = await prisma.virtualExhibition.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { artworks: true } },
      createdBy: { select: { name: true } },
    },
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-24 pb-20">
        <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tight mb-4">
              {t("virtualExhibitions.title")}
            </h1>
            <p className="text-neutral-400 text-lg">
              {t("virtualExhibitions.subtitle")}
            </p>
          </div>
        </section>

        {exhibitions.length === 0 ? (
          <section className="max-w-2xl mx-auto px-6 text-center py-24">
            <div className="rounded-full w-24 h-24 bg-neutral-900 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-amber-600/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 21h10a2 2 0 002-2v-6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-white mb-2">
              {t("virtualExhibitions.empty")}
            </h2>
            <p className="text-neutral-500">
              {t("virtualExhibitions.emptyDesc")}
            </p>
          </section>
        ) : (
          <section className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {exhibitions.map((exhibition) => {
                const coverUrl = exhibition.coverImage || ""
                const count = exhibition._count.artworks
                const artworksLabel = t("virtualExhibitions.artworks")
                  .replace("{count}", String(count))
                  .replace("{plural}", count > 1 ? "s" : "")

                return (
                  <Link
                    key={exhibition.id}
                    href={`/expositions-virtuelles/${exhibition.slug}`}
                    className="group block"
                  >
                    <article className="bg-neutral-900/80 rounded-lg overflow-hidden border border-neutral-800 hover:border-amber-600/40 transition-all duration-300">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        {coverUrl ? (
                          <Image
                            src={coverUrl}
                            alt={exhibition.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div
                            className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-amber-950/30 to-neutral-900"
                            aria-hidden
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              exhibition.theme === "dark"
                                ? "bg-amber-600/90 text-black"
                                : "bg-white/20 text-white backdrop-blur-sm"
                            }`}
                          >
                            {exhibition.theme === "dark" ? "Sombre" : "Clair"}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h2 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors mb-2 line-clamp-2">
                          {exhibition.title}
                        </h2>
                        {exhibition.description && (
                          <p className="text-neutral-400 text-sm line-clamp-2 mb-4">
                            {exhibition.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500 text-sm">
                            {artworksLabel}
                            {exhibition.createdBy?.name && (
                              <span className="ml-2">
                                · {exhibition.createdBy.name}
                              </span>
                            )}
                          </span>
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black text-sm font-medium rounded transition-colors">
                            {t("virtualExhibitions.visit")}
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
