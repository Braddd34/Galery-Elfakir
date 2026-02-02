# Flows Métier Détaillés
## Galerie ELFAKIR - Processus Complets

---

## 📋 Vue d'ensemble

Ce document décrit tous les parcours utilisateurs et processus métier de la plateforme, avec les étapes techniques détaillées.

---

## 👤 1. GESTION DES UTILISATEURS

### 1.1 Inscription Artiste

```mermaid
Artiste → Formulaire inscription → Email validation → Admin review → Profil activé
```

**Étapes détaillées** :

1. **Formulaire d'inscription**
   - Email, mot de passe
   - Nom, prénom
   - Pays, ville
   - Portfolio (liens)
   - Bio courte

2. **Backend (API /api/auth/register)**
   ```typescript
   // 1. Validation données (Zod)
   const data = registerSchema.parse(body)
   
   // 2. Vérifier email unique
   const existing = await prisma.user.findUnique({ where: { email } })
   if (existing) throw new Error('Email déjà utilisé')
   
   // 3. Hash password
   const hashedPassword = await bcrypt.hash(password, 12)
   
   // 4. Créer user + profil artiste
   const user = await prisma.user.create({
     data: {
       email,
       password: hashedPassword,
       name,
       role: 'ARTIST',
       status: 'PENDING', // En attente validation
       artistProfile: {
         create: {
           bio,
           country,
           city,
           website,
           instagram,
         }
       }
     }
   })
   
   // 5. Envoyer email vérification
   await sendVerificationEmail(email, token)
   
   // 6. Notifier admin
   await notifyAdminNewArtist(user.id)
   ```

3. **Email de vérification**
   - Lien avec token unique
   - Expiration 24h

4. **Validation admin**
   - Admin review profil artiste
   - Vérification portfolio
   - Activation compte

5. **Email confirmation**
   - Compte activé
   - Lien vers dashboard

---

### 1.2 Inscription Acheteur

```mermaid
Acheteur → Formulaire simple → Email validation → Compte actif
```

**Différences avec artiste** :
- Pas de validation admin (automatique)
- Moins d'informations requises
- Création Stripe Customer automatique

```typescript
// Backend simplifié acheteur
const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name,
    role: 'BUYER',
    status: 'ACTIVE', // Direct actif
    buyerProfile: {
      create: {}
    }
  }
})

// Créer Stripe customer
const customer = await stripe.customers.create({
  email: user.email,
  name: user.name,
  metadata: { userId: user.id }
})

await prisma.buyerProfile.update({
  where: { userId: user.id },
  data: { stripeCustomerId: customer.id }
})
```

---

### 1.3 Connexion (NextAuth)

**Providers disponibles** :
1. **Email/Password** (classique)
2. **Google OAuth** (simplifié)
3. **Magic Link** (sans mot de passe)

```typescript
// lib/auth.ts (NextAuth config)
export const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user || user.status === 'DELETED') {
          throw new Error('Utilisateur introuvable')
        }
        
        if (user.status === 'SUSPENDED') {
          throw new Error('Compte suspendu')
        }
        
        const valid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        
        if (!valid) throw new Error('Mot de passe incorrect')
        
        return user
      }
    }),
    
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    }
  }
}
```

---

## 🎨 2. GESTION DES ŒUVRES

### 2.1 Ajout œuvre par artiste

```mermaid
Artiste → Formulaire œuvre → Upload images → Admin validation → Publication
```

**Formulaire détaillé** :

```typescript
// Schéma validation (Zod)
const artworkSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(50).max(2000),
  category: z.enum(['PAINTING', 'SCULPTURE', 'PHOTOGRAPHY', ...]),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  
  // Dimensions
  width: z.number().positive(),
  height: z.number().positive(),
  depth: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  
  // Technique
  medium: z.string().min(3).max(100),
  support: z.string().optional(),
  
  // Prix
  price: z.number().positive(),
  
  // Images (3 minimum, 10 maximum)
  images: z.array(z.object({
    url: z.string().url(),
    order: z.number().int(),
    alt: z.string()
  })).min(3).max(10),
  
  // Certificat
  certificateUrl: z.string().url().optional(),
  hasCertificate: z.boolean(),
  
  // SEO
  tags: z.array(z.string()).max(20)
})
```

**Upload d'images (Vercel Blob)** :

```typescript
// app/api/upload/route.ts
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  // Validation
  if (!file) throw new Error('Fichier manquant')
  if (!file.type.startsWith('image/')) throw new Error('Format invalide')
  if (file.size > 10_000_000) throw new Error('Fichier trop lourd (max 10MB)')
  
  // Upload vers Vercel Blob
  const blob = await put(file.name, file, {
    access: 'public',
    addRandomSuffix: true,
  })
  
  return Response.json({ url: blob.url })
}
```

**Création œuvre** :

```typescript
// app/api/artworks/route.ts
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ARTIST') {
    return Response.json({ error: 'Non autorisé' }, { status: 403 })
  }
  
  const body = await request.json()
  const data = artworkSchema.parse(body)
  
  // Générer slug unique
  const slug = await generateUniqueSlug(data.title)
  
  // Créer œuvre
  const artwork = await prisma.artwork.create({
    data: {
      ...data,
      slug,
      artistId: session.user.artistProfileId,
      status: 'PENDING', // En attente validation admin
      images: JSON.stringify(data.images),
    }
  })
  
  // Notifier admin
  await notifyAdminNewArtwork(artwork.id)
  
  return Response.json(artwork)
}
```

---

### 2.2 Validation admin

**Dashboard admin - Œuvres en attente** :

```typescript
// app/admin/artworks/pending/page.tsx
export default async function PendingArtworksPage() {
  const artworks = await prisma.artwork.findMany({
    where: { status: 'PENDING' },
    include: {
      artist: {
        include: {
          user: { select: { name: true, email: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return (
    <div>
      <h1>Œuvres en attente de validation</h1>
      {artworks.map(artwork => (
        <ArtworkReviewCard
          key={artwork.id}
          artwork={artwork}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}
    </div>
  )
}
```

**Actions admin** :

```typescript
// Approuver
async function approveArtwork(artworkId: string) {
  await prisma.artwork.update({
    where: { id: artworkId },
    data: {
      status: 'AVAILABLE',
      publishedAt: new Date()
    }
  })
  
  // Notifier artiste
  await sendEmail({
    to: artist.user.email,
    subject: 'Œuvre approuvée',
    template: 'artwork-approved',
    data: { artworkTitle, artworkUrl }
  })
}

// Rejeter
async function rejectArtwork(artworkId: string, reason: string) {
  await prisma.artwork.update({
    where: { id: artworkId },
    data: { status: 'ARCHIVED' }
  })
  
  // Notifier artiste avec raison
  await sendEmail({
    to: artist.user.email,
    subject: 'Œuvre refusée',
    template: 'artwork-rejected',
    data: { artworkTitle, reason }
  })
}
```

---

## 🛒 3. PARCOURS D'ACHAT

### 3.1 Navigation catalogue

**Page catalogue avec filtres** :

```typescript
// app/catalogue/page.tsx
export default async function CataloguePage({ searchParams }) {
  const filters = {
    category: searchParams.category,
    minPrice: Number(searchParams.minPrice) || 0,
    maxPrice: Number(searchParams.maxPrice) || 999999,
    artistId: searchParams.artist,
    tags: searchParams.tags?.split(','),
  }
  
  const artworks = await prisma.artwork.findMany({
    where: {
      status: 'AVAILABLE',
      category: filters.category || undefined,
      price: {
        gte: filters.minPrice,
        lte: filters.maxPrice,
      },
      artistId: filters.artistId || undefined,
      tags: filters.tags ? { hasEvery: filters.tags } : undefined,
    },
    include: {
      artist: {
        include: {
          user: { select: { name: true, image: true } }
        }
      }
    },
    orderBy: { publishedAt: 'desc' }
  })
  
  return <CatalogueView artworks={artworks} filters={filters} />
}
```

---

### 3.2 Détail œuvre

**Page avec toutes les infos** :

```typescript
// app/oeuvre/[slug]/page.tsx
export default async function ArtworkDetailPage({ params }) {
  const artwork = await prisma.artwork.findUnique({
    where: { slug: params.slug },
    include: {
      artist: {
        include: {
          user: true,
          artworks: {
            where: { status: 'AVAILABLE' },
            take: 4,
          }
        }
      }
    }
  })
  
  if (!artwork || artwork.status !== 'AVAILABLE') {
    notFound()
  }
  
  // Incrémenter vues
  await prisma.artwork.update({
    where: { id: artwork.id },
    data: { views: { increment: 1 } }
  })
  
  return (
    <div>
      {/* Galerie photos */}
      <ImageGallery images={JSON.parse(artwork.images)} />
      
      {/* Infos */}
      <ArtworkInfo artwork={artwork} />
      
      {/* Bouton achat */}
      <BuyButton artworkId={artwork.id} />
      
      {/* Artiste */}
      <ArtistSection artist={artwork.artist} />
      
      {/* Œuvres similaires */}
      <SimilarArtworks artworks={artwork.artist.artworks} />
    </div>
  )
}
```

---

### 3.3 Processus de paiement (Stripe)

**Créer session Stripe Checkout** :

```typescript
// app/api/checkout/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: 'Non connecté' }, { status: 401 })
  }
  
  const { artworkId } = await request.json()
  
  // 1. Vérifier disponibilité œuvre
  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
    include: { artist: true }
  })
  
  if (!artwork || artwork.status !== 'AVAILABLE') {
    return Response.json({ error: 'Œuvre indisponible' }, { status: 400 })
  }
  
  // 2. Marquer réservée temporairement
  await prisma.artwork.update({
    where: { id: artworkId },
    data: { status: 'RESERVED' }
  })
  
  // 3. Calculer commission
  const commissionRate = artwork.artist.commissionRate
  const commissionAmount = artwork.price * (commissionRate / 100)
  const artistPayout = artwork.price - commissionAmount
  
  // 4. Créer ordre (en attente paiement)
  const orderNumber = await generateOrderNumber()
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session.user.id,
      artworkSnapshot: JSON.stringify(artwork),
      subtotal: artwork.price,
      shippingCost: 50, // À calculer selon destination
      tax: artwork.price * 0.2, // TVA 20%
      total: artwork.price + 50 + (artwork.price * 0.2),
      commissionRate,
      commissionAmount,
      artistPayout,
      status: 'PENDING',
      shippingAddress: {}, // À compléter dans Stripe
    }
  })
  
  // 5. Créer session Stripe Checkout
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: session.user.email,
    client_reference_id: order.id,
    
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: artwork.title,
            description: `${artwork.artist.user.name} - ${artwork.year}`,
            images: [JSON.parse(artwork.images)[0].url],
          },
          unit_amount: Math.round(artwork.price * 100), // En centimes
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Frais de livraison',
          },
          unit_amount: 5000, // 50€
        },
        quantity: 1,
      },
    ],
    
    shipping_address_collection: {
      allowed_countries: ['FR', 'BE', 'CH', 'DE', 'IT', 'ES', 'NL'],
    },
    
    success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/oeuvre/${artwork.slug}`,
    
    metadata: {
      orderId: order.id,
      artworkId: artwork.id,
    },
    
    // Activer 3D Secure
    payment_intent_data: {
      capture_method: 'automatic',
    },
  })
  
  // 6. Sauvegarder session ID
  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: stripeSession.id }
  })
  
  return Response.json({ url: stripeSession.url })
}
```

---

### 3.4 Webhook Stripe (confirmation paiement)

```typescript
// app/api/stripe/webhook/route.ts
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    return Response.json({ error: 'Webhook error' }, { status: 400 })
  }
  
  // Traiter événement
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object)
      break
    
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object)
      break
    
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object)
      break
  }
  
  return Response.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata!.orderId
  const artworkId = session.metadata!.artworkId
  
  // Transaction atomique
  await prisma.$transaction(async (tx) => {
    // 1. Mettre à jour commande
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        stripePaymentId: session.payment_intent as string,
        shippingAddress: session.shipping_details,
      }
    })
    
    // 2. Marquer œuvre vendue
    await tx.artwork.update({
      where: { id: artworkId },
      data: {
        status: 'SOLD',
        soldAt: new Date(),
        orderId,
      }
    })
    
    // 3. Mettre à jour stats artiste
    await tx.artistProfile.update({
      where: { id: artwork.artistId },
      data: {
        totalSales: { increment: 1 },
        totalRevenue: { increment: artistPayout },
      }
    })
  })
  
  // 4. Transférer paiement à l'artiste (Stripe Connect)
  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
    include: { artist: true }
  })
  
  if (artwork.artist.stripeAccountId) {
    const transfer = await stripe.transfers.create({
      amount: Math.round(artistPayout * 100),
      currency: 'eur',
      destination: artwork.artist.stripeAccountId,
      transfer_group: orderId,
    })
    
    await prisma.order.update({
      where: { id: orderId },
      data: { stripeTransferId: transfer.id }
    })
  }
  
  // 5. Envoyer emails
  await Promise.all([
    // Confirmation client
    sendEmail({
      to: session.customer_email!,
      subject: 'Commande confirmée',
      template: 'order-confirmed',
      data: { orderNumber, artwork }
    }),
    
    // Notification artiste
    sendEmail({
      to: artwork.artist.user.email,
      subject: 'Œuvre vendue !',
      template: 'artwork-sold',
      data: { artwork, amount: artistPayout }
    }),
    
    // Notification admin
    sendEmail({
      to: 'admin@galerie-elfakir.com',
      subject: 'Nouvelle vente',
      template: 'new-sale',
      data: { orderNumber, artwork }
    }),
  ])
  
  // 6. Générer certificat authenticité
  await generateCertificate(orderId)
}
```

---

## 📦 4. APRÈS-VENTE

### 4.1 Préparation envoi (Admin)

```typescript
// Dashboard admin - Commandes à expédier
export default async function OrdersToShipPage() {
  const orders = await prisma.order.findMany({
    where: { status: 'PAID' },
    include: {
      user: true,
      artwork: {
        include: {
          artist: { include: { user: true } }
        }
      }
    },
    orderBy: { paidAt: 'desc' }
  })
  
  return (
    <div>
      {orders.map(order => (
        <OrderCard
          key={order.id}
          order={order}
          onMarkShipped={handleMarkShipped}
        />
      ))}
    </div>
  )
}

async function handleMarkShipped(
  orderId: string,
  trackingNumber: string,
  carrier: string
) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'SHIPPED',
      shippedAt: new Date(),
      trackingNumber,
      shippingCarrier: carrier,
    }
  })
  
  // Email client avec suivi
  await sendEmail({
    to: order.user.email,
    subject: 'Votre œuvre a été expédiée',
    template: 'order-shipped',
    data: { orderNumber, trackingNumber, carrier, trackingUrl }
  })
}
```

---

### 4.2 Génération certificat authenticité

```typescript
// lib/certificate.ts
import { PDFDocument, rgb } from 'pdf-lib'

export async function generateCertificate(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      artwork: {
        include: {
          artist: { include: { user: true } }
        }
      }
    }
  })
  
  // Créer PDF
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4
  
  // Ajouter contenu
  page.drawText('CERTIFICAT D\'AUTHENTICITÉ', {
    x: 50,
    y: 750,
    size: 24,
    color: rgb(0, 0, 0)
  })
  
  page.drawText(`Œuvre : ${order.artwork.title}`, { x: 50, y: 700 })
  page.drawText(`Artiste : ${order.artwork.artist.user.name}`, { x: 50, y: 680 })
  page.drawText(`Année : ${order.artwork.year}`, { x: 50, y: 660 })
  page.drawText(`Technique : ${order.artwork.medium}`, { x: 50, y: 640 })
  page.drawText(`Dimensions : ${order.artwork.width}x${order.artwork.height}cm`, { x: 50, y: 620 })
  page.drawText(`Acheteur : ${order.user.name}`, { x: 50, y: 580 })
  page.drawText(`Date : ${new Date().toLocaleDateString('fr-FR')}`, { x: 50, y: 560 })
  
  // Sauvegarder
  const pdfBytes = await pdfDoc.save()
  
  // Upload vers Vercel Blob
  const blob = await put(
    `certificates/${orderId}.pdf`,
    pdfBytes,
    { access: 'public' }
  )
  
  // Mettre à jour commande
  await prisma.order.update({
    where: { id: orderId },
    data: {
      certificateGenerated: true,
      certificateSentAt: new Date(),
    }
  })
  
  // Envoyer par email
  await sendEmail({
    to: order.user.email,
    subject: 'Certificat d\'authenticité',
    template: 'certificate',
    attachments: [
      {
        filename: 'certificat.pdf',
        content: pdfBytes
      }
    ]
  })
  
  return blob.url
}
```

---

## 🎨 5. GESTION ARTISTES

### 5.1 Onboarding Stripe Connect

**Permettre aux artistes de recevoir paiements** :

```typescript
// app/api/artists/connect/route.ts
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ARTIST') {
    return Response.json({ error: 'Non autorisé' }, { status: 403 })
  }
  
  const artistProfile = await prisma.artistProfile.findUnique({
    where: { userId: session.user.id }
  })
  
  // Créer ou récupérer compte Stripe Connect
  let accountId = artistProfile.stripeAccountId
  
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      country: artistProfile.country || 'FR',
      email: session.user.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        artistProfileId: artistProfile.id,
      },
    })
    
    accountId = account.id
    
    await prisma.artistProfile.update({
      where: { id: artistProfile.id },
      data: { stripeAccountId: accountId }
    })
  }
  
  // Créer lien onboarding
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/artiste/paiements`,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard/artiste/paiements/success`,
    type: 'account_onboarding',
  })
  
  return Response.json({ url: accountLink.url })
}
```

---

### 5.2 Dashboard artiste - Statistiques

```typescript
// app/dashboard/artiste/page.tsx
export default async function ArtistDashboard() {
  const session = await getServerSession(authOptions)
  
  const stats = await prisma.artistProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      artworks: {
        where: {
          OR: [
            { status: 'AVAILABLE' },
            { status: 'SOLD' }
          ]
        }
      },
      _count: {
        select: {
          artworks: {
            where: { status: 'SOLD' }
          }
        }
      }
    }
  })
  
  return (
    <div>
      <h1>Tableau de bord</h1>
      
      <StatsCards>
        <StatCard
          label="Œuvres disponibles"
          value={stats.artworks.filter(a => a.status === 'AVAILABLE').length}
        />
        <StatCard
          label="Œuvres vendues"
          value={stats._count.artworks}
        />
        <StatCard
          label="Revenus totaux"
          value={`${stats.totalRevenue.toFixed(2)}€`}
        />
      </StatsCards>
      
      <RecentSales />
      <ArtworksTable artworks={stats.artworks} />
    </div>
  )
}
```

---

## 🔐 6. RGPD & CONFORMITÉ

### 6.1 Export données utilisateur

```typescript
// app/api/user/export/route.ts
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Non autorisé' }, { status: 401 })
  
  // Récupérer toutes les données de l'utilisateur
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      artistProfile: {
        include: { artworks: true }
      },
      buyerProfile: true,
      orders: true,
      favorites: {
        include: { artwork: true }
      },
    }
  })
  
  // Formater en JSON
  const exportData = {
    user: {
      email: userData.email,
      name: userData.name,
      createdAt: userData.createdAt,
    },
    profile: userData.artistProfile || userData.buyerProfile,
    orders: userData.orders,
    favorites: userData.favorites,
  }
  
  return Response.json(exportData, {
    headers: {
      'Content-Disposition': `attachment; filename="mes-donnees-${Date.now()}.json"`
    }
  })
}
```

---

### 6.2 Suppression compte

```typescript
// app/api/user/delete/route.ts
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Non autorisé' }, { status: 401 })
  
  // Vérifier pas de commande en cours
  const pendingOrders = await prisma.order.count({
    where: {
      userId: session.user.id,
      status: { in: ['PENDING', 'PROCESSING', 'PAID', 'SHIPPED'] }
    }
  })
  
  if (pendingOrders > 0) {
    return Response.json({
      error: 'Impossible de supprimer : commandes en cours'
    }, { status: 400 })
  }
  
  // Soft delete (anonymisation)
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      status: 'DELETED',
      email: `deleted-${session.user.id}@deleted.local`,
      name: 'Utilisateur supprimé',
      password: null,
      image: null,
      deletedAt: new Date(),
    }
  })
  
  // Détruire session
  await signOut({ redirect: false })
  
  return Response.json({ success: true })
}
```

---

## 📊 7. MONITORING & ANALYTICS

### 7.1 Tracking événements

```typescript
// lib/analytics.ts
export function trackEvent(event: string, data?: Record<string, any>) {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, data)
  }
  
  // Plausible Analytics (RGPD-friendly)
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(event, { props: data })
  }
}

// Événements métier
export const events = {
  viewArtwork: (artworkId: string) => trackEvent('view_artwork', { artworkId }),
  addToFavorites: (artworkId: string) => trackEvent('add_favorite', { artworkId }),
  startCheckout: (artworkId: string, price: number) => trackEvent('begin_checkout', { artworkId, value: price }),
  completePurchase: (orderId: string, total: number) => trackEvent('purchase', { orderId, value: total }),
  shareArtwork: (artworkId: string, method: string) => trackEvent('share', { artworkId, method }),
}
```

---

## 🎯 Résumé

Tous les flows métier sont conçus pour être :

✅ **Sécurisés** : Validation à chaque étape  
✅ **Atomiques** : Transactions DB pour cohérence  
✅ **Tracés** : Emails + notifications  
✅ **Conformes** : RGPD + droit européen  
✅ **Scalables** : Architecture serverless  

---

## 📚 Ressources

- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Connect](https://stripe.com/docs/connect)
- [NextAuth.js](https://next-auth.js.org/)
- [Prisma Transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)
