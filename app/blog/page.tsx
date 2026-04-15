import Link from "next/link"
import Image from "next/image"
import { Metadata } from "next"
import prisma from "@/lib/prisma"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getServerTranslation } from "@/lib/i18n-server"

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Explorez notre journal : actualités du monde de l'art, coulisses de la galerie, interviews d'artistes et réflexions sur l'art contemporain.",
}

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || "1"))
  const limit = 9
  const skip = (page - 1) * limit

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        author: {
          select: { name: true, image: true },
        },
      },
    }),
    prisma.blogPost.count({ where: { published: true } }),
  ])

  const totalPages = Math.ceil(total / limit)

  const t = getServerTranslation()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white pt-32 pb-20">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-4">
            {t("blog.title")}
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl">
            {t("blog.desc")}
          </p>
          <div className="mt-6 h-px bg-neutral-800" />
        </section>

        {/* Grid */}
        {posts.length === 0 ? (
          <section className="max-w-7xl mx-auto px-6 md:px-12">
            <p className="text-neutral-500 text-center py-20">
              {t("blog.noPosts")}
            </p>
          </section>
        ) : (
          <section className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block border border-neutral-800 hover:border-neutral-600 transition-colors"
                >
                  {/* Cover */}
                  <div className="relative aspect-[16/10] bg-neutral-900 overflow-hidden">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-neutral-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      {post.author.image ? (
                        <Image
                          src={post.author.image}
                          alt={post.author.name || ""}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400">
                          {post.author.name?.charAt(0) || "?"}
                        </div>
                      )}
                      <span className="text-xs text-neutral-500">
                        {post.author.name}
                      </span>
                      <span className="text-neutral-700">·</span>
                      <time className="text-xs text-neutral-500">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString(
                              "fr-FR",
                              { day: "numeric", month: "long", year: "numeric" }
                            )
                          : ""}
                      </time>
                    </div>

                    <h2 className="text-lg font-light mb-2 group-hover:text-neutral-300 transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-sm text-neutral-500 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}

                    <span className="inline-block mt-4 text-xs text-neutral-400 group-hover:text-white transition-colors tracking-wider uppercase">
                      {t("blog.readArticle")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-16 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/blog?page=${page - 1}`}
                    className="px-4 py-2 text-sm border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                  >
                    {t("blog.prev")}
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Link
                      key={p}
                      href={`/blog?page=${p}`}
                      className={`px-4 py-2 text-sm border transition-colors ${
                        p === page
                          ? "border-white text-white"
                          : "border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}

                {page < totalPages && (
                  <Link
                    href={`/blog?page=${page + 1}`}
                    className="px-4 py-2 text-sm border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                  >
                    {t("blog.next")}
                  </Link>
                )}
              </nav>
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
