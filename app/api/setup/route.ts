import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import prisma from "@/lib/prisma"

// Cette route permet d'initialiser la base de données une seule fois
// Accès : GET /api/setup?secret=VOTRE_SECRET
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")

  // Vérification de sécurité
  if (secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@elfakir.art" }
    })

    if (existingAdmin) {
      return NextResponse.json({
        message: "Base de données déjà initialisée",
        admin: existingAdmin.email
      })
    }

    console.log("🌱 Début de l'initialisation...")

    // Créer l'admin par défaut
    const adminPassword = await bcrypt.hash("Admin123!", 12)

    const admin = await prisma.user.create({
      data: {
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

    const artist = await prisma.user.create({
      data: {
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

    const buyer = await prisma.user.create({
      data: {
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
          category: "PAINTING",
          year: 2024,
          width: 100,
          height: 80,
          medium: "Huile sur toile",
          price: 2500,
          slug: "harmonie-abstraite",
          status: "AVAILABLE",
          images: JSON.stringify([
            { url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200", order: 0 }
          ]),
          tags: ["abstrait", "contemporain", "huile"],
          publishedAt: new Date(),
        },
        {
          title: "Nature Silencieuse",
          description: "Une exploration méditative de la nature et du silence, capturant l'essence de la tranquillité.",
          category: "PAINTING",
          year: 2023,
          width: 80,
          height: 60,
          medium: "Acrylique sur toile",
          price: 1800,
          slug: "nature-silencieuse",
          status: "AVAILABLE",
          images: JSON.stringify([
            { url: "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=1200", order: 0 }
          ]),
          tags: ["nature", "minimaliste", "acrylique"],
          publishedAt: new Date(),
        },
        {
          title: "Lumière d'Été",
          description: "Les jeux de lumière estivale capturés dans une composition vibrante et énergique.",
          category: "PHOTOGRAPHY",
          year: 2024,
          width: 60,
          height: 90,
          medium: "Photographie sur papier Fine Art",
          price: 3200,
          slug: "lumiere-ete",
          status: "AVAILABLE",
          images: JSON.stringify([
            { url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200", order: 0 }
          ]),
          tags: ["photographie", "lumière", "été"],
          publishedAt: new Date(),
        },
      ]

      for (const artwork of artworks) {
        await prisma.artwork.create({
          data: {
            ...artwork,
            artistId: artistProfile.id,
          } as any,
        })
        console.log("✅ Œuvre créée:", artwork.title)
      }
    }

    // Créer les paramètres par défaut
    await prisma.setting.create({
      data: {
        key: "commission_rate",
        value: 30,
      },
    })

    await prisma.setting.create({
      data: {
        key: "shipping_cost",
        value: 50,
      },
    })

    console.log("✅ Paramètres créés")

    return NextResponse.json({
      success: true,
      message: "Base de données initialisée avec succès.",
      accounts: {
        admin: admin.email,
        artist: artist.email,
        buyer: buyer.email,
      },
      note: "Les mots de passe par défaut ont été créés. Changez-les immédiatement depuis l'interface.",
      artworks: 3,
    })

  } catch (error: any) {
    console.error("❌ Erreur:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'initialisation", details: error.message },
      { status: 500 }
    )
  }
}
