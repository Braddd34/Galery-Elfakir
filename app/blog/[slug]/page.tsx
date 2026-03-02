import Link from "next/link"
import Image from "next/image"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { sanitizeBlogHtml } from "@/lib/sanitize"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
    select: { title: true, excerpt: true, coverImage: true },
  })

  if (!post) return { title: "Article non trouvé" }

  return {
    title: post.title,
    description: post.excerpt || `Lisez "${post.title}" sur le journal ELFAKIR.`,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
      type: "article",
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params

  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
    include: {
      author: {
        select: { name: true, image: true },
      },
    },
  })

  if (!post) notFound()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white pt-32 pb-20">
        {/* Breadcrumbs */}
        <div className="max-w-4xl mx-auto px-6 md:px-12 mb-8">
          <nav className="flex items-center gap-2 text-sm text-neutral-500">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-neutral-300 truncate max-w-[200px]">
              {post.title}
            </span>
          </nav>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="max-w-5xl mx-auto px-6 md:px-12 mb-10">
            <div className="relative aspect-[21/9] overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-6 md:px-12">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wide mb-6">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 pb-8 border-b border-neutral-800">
              {post.author.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name || ""}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm text-neutral-400">
                  {post.author.name?.charAt(0) || "?"}
                </div>
              )}
              <div>
                <p className="text-sm text-white">{post.author.name}</p>
                <time className="text-xs text-neutral-500">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </time>
              </div>
            </div>
          </header>

          {/* Content */}
          <div
            className="prose prose-invert prose-lg max-w-none
              prose-headings:font-light prose-headings:tracking-wide
              prose-p:text-neutral-300 prose-p:leading-relaxed
              prose-a:text-white prose-a:underline prose-a:underline-offset-4
              prose-strong:text-white
              prose-img:rounded-none
              prose-blockquote:border-neutral-700 prose-blockquote:text-neutral-400"
            dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(post.content ?? "") }}
          />

          {/* Back link */}
          <div className="mt-16 pt-8 border-t border-neutral-800">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Retour au journal
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
