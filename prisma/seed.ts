import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Début du seeding...")

  // Créer l'admin par défaut
  const adminPassword = await bcrypt.hash("Admin123!", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@elfakir.art" },
    update: {},
    create: {
      email: "admin@elfakir.art",
      password: adminPassword,
      name: "Admin ELFAKIR",
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  })

  console.log("✅ Admin créé:", admin.email)

  // Créer un artiste de test
  const artistPassword = await bcrypt.hash("Artiste123!", 12)

  const artist = await prisma.user.upsert({
    where: { email: "artiste@test.com" },
    update: {},
    create: {
      email: "artiste@test.com",
      password: artistPassword,
      name: "Marie Dupont",
      role: "ARTIST",
      status: "ACTIVE",
      emailVerified: new Date(),
      artistProfile: {
        create: {
          bio: "Artiste contemporaine spécialisée dans l'abstraction lyrique.",
          country: "France",
          city: "Paris",
        },
      },
    },
  })

  console.log("✅ Artiste créé:", artist.email)

  // Créer un acheteur de test
  const buyerPassword = await bcrypt.hash("Acheteur123!", 12)

  const buyer = await prisma.user.upsert({
    where: { email: "acheteur@test.com" },
    update: {},
    create: {
      email: "acheteur@test.com",
      password: buyerPassword,
      name: "Jean Martin",
      role: "BUYER",
      status: "ACTIVE",
      emailVerified: new Date(),
      buyerProfile: {
        create: {
          firstName: "Jean",
          lastName: "Martin",
          country: "France",
        },
      },
    },
  })

  console.log("✅ Acheteur créé:", buyer.email)

  // Récupérer le profil artiste pour créer des œuvres
  const artistProfile = await prisma.artistProfile.findUnique({
    where: { userId: artist.id },
  })

  if (artistProfile) {
    // Créer quelques œuvres de démonstration
    const artworks = [
      {
        title: "Harmonie Abstraite",
        description: "Cette œuvre explore les tensions entre forme et couleur, créant un dialogue visuel qui invite à la contemplation.",
        category: "PAINTING" as const,
        year: 2024,
        width: 100,
        height: 80,
        medium: "Huile sur toile",
        price: 2500,
        slug: "harmonie-abstraite",
        status: "AVAILABLE" as const,
        images: JSON.stringify([
          { url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200", order: 0 }
        ]),
        tags: ["abstrait", "contemporain", "huile"],
        publishedAt: new Date(),
      },
      {
        title: "Nature Silencieuse",
        description: "Une exploration méditative de la nature et du silence, capturant l'essence de la tranquillité.",
        category: "PAINTING" as const,
        year: 2023,
        width: 80,
        height: 60,
        medium: "Acrylique sur toile",
        price: 1800,
        slug: "nature-silencieuse",
        status: "AVAILABLE" as const,
        images: JSON.stringify([
          { url: "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=1200", order: 0 }
        ]),
        tags: ["nature", "minimaliste", "acrylique"],
        publishedAt: new Date(),
      },
      {
        title: "Lumière d'Été",
        description: "Les jeux de lumière estivale capturés dans une composition vibrante et énergique.",
        category: "PHOTOGRAPHY" as const,
        year: 2024,
        width: 60,
        height: 90,
        medium: "Photographie sur papier Fine Art",
        price: 3200,
        slug: "lumiere-ete",
        status: "AVAILABLE" as const,
        images: JSON.stringify([
          { url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200", order: 0 }
        ]),
        tags: ["photographie", "lumière", "été"],
        publishedAt: new Date(),
      },
    ]

    for (const artwork of artworks) {
      await prisma.artwork.upsert({
        where: { slug: artwork.slug },
        update: {},
        create: {
          ...artwork,
          artistId: artistProfile.id,
        },
      })
      console.log("✅ Œuvre créée:", artwork.title)
    }
  }

  // Créer les paramètres par défaut
  await prisma.setting.upsert({
    where: { key: "commission_rate" },
    update: {},
    create: {
      key: "commission_rate",
      value: 30,
    },
  })

  await prisma.setting.upsert({
    where: { key: "shipping_cost" },
    update: {},
    create: {
      key: "shipping_cost",
      value: 50,
    },
  })

  console.log("✅ Paramètres créés")

  // Attribuer l'avatar par défaut à tous les artistes sans photo
  const defaultAvatarUrl = "https://galeryelfakir.vercel.app/avatar-placeholder.svg"
  const avatarResult = await prisma.user.updateMany({
    where: { role: "ARTIST", image: null },
    data: { image: defaultAvatarUrl },
  })
  if (avatarResult.count > 0) {
    console.log(`✅ ${avatarResult.count} artiste(s) sans photo → avatar par défaut assigné`)
  }

  console.log("")
  console.log("🎉 Seeding terminé !")
  console.log("")
  console.log("📋 Comptes de test :")
  console.log("-------------------")
  console.log("Admin:    admin@elfakir.art / Admin123!")
  console.log("Artiste:  artiste@test.com / Artiste123!")
  console.log("Acheteur: acheteur@test.com / Acheteur123!")
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
