import type { Metadata } from "next"
import prisma from "@/lib/prisma"

interface Props {
  params: { slug: string }
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const exhibition = await prisma.virtualExhibition.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
    select: { title: true, description: true },
  })

  if (!exhibition) {
    return { title: "Exposition non trouvée" }
  }

  return {
    title: exhibition.title,
    description:
      exhibition.description ||
      `Visitez l'exposition virtuelle "${exhibition.title}" en 3D sur ELFAKIR.`,
    openGraph: {
      title: `${exhibition.title} — Exposition Virtuelle ELFAKIR`,
      description:
        exhibition.description ||
        `Découvrez l'exposition "${exhibition.title}" en visite virtuelle 3D.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${exhibition.title} — ELFAKIR`,
      description:
        exhibition.description ||
        `Visitez l'exposition "${exhibition.title}" en 3D.`,
    },
  }
}

export default function ExhibitionLayout({ children }: Props) {
  return children
}
