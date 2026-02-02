# Schéma Base de Données PostgreSQL
## Galerie ELFAKIR - Modèle Prisma

---

## 📊 Vue d'ensemble

Modèle de données optimisé pour une galerie d'art en ligne avec :
- Gestion multi-rôles (Admin, Artiste, Acheteur)
- Œuvres uniques (stock = 1)
- Mandat de vente avec commissions
- Certificats d'authenticité
- Historique complet des transactions

---

## 🗄️ Schéma Prisma Complet

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ==========================================
// AUTHENTIFICATION & UTILISATEURS
// ==========================================

enum UserRole {
  ADMIN    // Administrateur galerie
  ARTIST   // Artiste
  BUYER    // Acheteur
}

enum UserStatus {
  PENDING    // En attente de validation
  ACTIVE     // Actif
  SUSPENDED  // Suspendu
  DELETED    // Supprimé (soft delete)
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  password      String?   // Nullable si OAuth
  name          String?
  image         String?   // Photo de profil
  role          UserRole  @default(BUYER)
  status        UserStatus @default(PENDING)
  
  // Métadonnées
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  artistProfile ArtistProfile?
  buyerProfile  BuyerProfile?
  orders        Order[]
  favorites     Favorite[]
  
  @@map("users")
}

// NextAuth Account (OAuth providers)
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

// NextAuth Session
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

// Tokens de vérification (email, reset password)
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ==========================================
// PROFILS
// ==========================================

model ArtistProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Informations artiste
  bio         String?  @db.Text
  country     String?
  city        String?
  website     String?
  instagram   String?
  phone       String?
  
  // Informations légales
  siret       String?  // Pour artistes français
  vatNumber   String?  // Numéro TVA intracommunautaire
  
  // Paiements (Stripe Connect)
  stripeAccountId String? @unique
  stripeOnboarded Boolean @default(false)
  
  // Commission (négociée avec galerie)
  commissionRate  Decimal @default(30.0) @db.Decimal(5,2) // Ex: 30%
  
  // Statistiques
  totalSales      Int     @default(0)
  totalRevenue    Decimal @default(0) @db.Decimal(10,2)
  
  // Métadonnées
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  artworks    Artwork[]
  
  @@map("artist_profiles")
}

model BuyerProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Adresse de livraison par défaut
  firstName   String?
  lastName    String?
  address     String?
  city        String?
  postalCode  String?
  country     String?
  phone       String?
  
  // Stripe Customer ID
  stripeCustomerId String? @unique
  
  // Métadonnées
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("buyer_profiles")
}

// ==========================================
// ŒUVRES D'ART
// ==========================================

enum ArtworkStatus {
  DRAFT        // Brouillon (artiste)
  PENDING      // En attente validation admin
  AVAILABLE    // Disponible à la vente
  RESERVED     // Réservée (paiement en cours)
  SOLD         // Vendue
  ARCHIVED     // Archivée (retirée de la vente)
}

enum ArtworkCategory {
  PAINTING     // Peinture
  SCULPTURE    // Sculpture
  PHOTOGRAPHY  // Photographie
  DRAWING      // Dessin
  PRINT        // Estampe
  DIGITAL      // Art numérique
  MIXED_MEDIA  // Technique mixte
  OTHER        // Autre
}

model Artwork {
  id          String   @id @default(cuid())
  
  // Informations principales
  title       String
  description String   @db.Text
  category    ArtworkCategory
  year        Int      // Année de création
  
  // Caractéristiques techniques
  width       Decimal  @db.Decimal(8,2) // en cm
  height      Decimal  @db.Decimal(8,2) // en cm
  depth       Decimal? @db.Decimal(8,2) // en cm (optionnel)
  weight      Decimal? @db.Decimal(8,2) // en kg (optionnel)
  medium      String   // Technique (huile, acrylique, bronze, etc.)
  support     String?  // Support (toile, papier, etc.)
  
  // Prix et vente
  price       Decimal  @db.Decimal(10,2)
  currency    String   @default("EUR")
  status      ArtworkStatus @default(DRAFT)
  
  // Artiste
  artistId    String
  artist      ArtistProfile @relation(fields: [artistId], references: [id], onDelete: Restrict)
  
  // Certificat d'authenticité
  certificateUrl String? // Lien vers PDF certificat
  hasCertificate Boolean @default(true)
  
  // Images (JSON array)
  images      Json     // [{url: string, order: number, alt: string}]
  
  // SEO
  slug        String   @unique
  tags        String[] // Tags pour recherche
  
  // Vente
  soldAt      DateTime?
  orderId     String?   @unique
  order       Order?    @relation(fields: [orderId], references: [id])
  
  // Métadonnées
  views       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?
  
  // Relations
  favorites   Favorite[]
  
  @@index([artistId])
  @@index([status])
  @@index([category])
  @@index([slug])
  @@map("artworks")
}

// ==========================================
// COMMANDES & PAIEMENTS
// ==========================================

enum OrderStatus {
  PENDING        // En attente paiement
  PROCESSING     // Paiement en cours
  PAID           // Payé
  SHIPPED        // Expédié
  DELIVERED      // Livré
  CANCELLED      // Annulé
  REFUNDED       // Remboursé
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique // Ex: ORD-2024-00001
  
  // Client
  userId          String
  user            User        @relation(fields: [userId], references: [id], onDelete: Restrict)
  
  // Œuvre (1 œuvre par commande = stock unique)
  artwork         Artwork?
  artworkSnapshot Json        // Sauvegarde des infos œuvre (prix, titre, etc.)
  
  // Prix
  subtotal        Decimal     @db.Decimal(10,2)
  shippingCost    Decimal     @db.Decimal(10,2)
  tax             Decimal     @db.Decimal(10,2)
  total           Decimal     @db.Decimal(10,2)
  currency        String      @default("EUR")
  
  // Commission galerie
  commissionRate  Decimal     @db.Decimal(5,2)
  commissionAmount Decimal    @db.Decimal(10,2)
  artistPayout    Decimal     @db.Decimal(10,2)
  
  // Statut
  status          OrderStatus @default(PENDING)
  
  // Paiement Stripe
  stripeSessionId    String?  @unique
  stripePaymentId    String?  @unique
  stripeTransferId   String?  // Transfer vers artiste
  paidAt             DateTime?
  
  // Adresse de livraison
  shippingAddress    Json     // {name, address, city, postalCode, country, phone}
  
  // Livraison
  trackingNumber     String?
  shippingCarrier    String?
  shippedAt          DateTime?
  deliveredAt        DateTime?
  
  // Certificat
  certificateGenerated Boolean  @default(false)
  certificateSentAt    DateTime?
  
  // Métadonnées
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([userId])
  @@index([status])
  @@index([orderNumber])
  @@map("orders")
}

// ==========================================
// FAVORIS
// ==========================================

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  artworkId String
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  artwork   Artwork  @relation(fields: [artworkId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([userId, artworkId])
  @@index([userId])
  @@index([artworkId])
  @@map("favorites")
}

// ==========================================
// NOTIFICATIONS
// ==========================================

enum NotificationType {
  ORDER_PLACED       // Nouvelle commande
  ORDER_PAID         // Commande payée
  ORDER_SHIPPED      // Commande expédiée
  ARTWORK_SOLD       // Œuvre vendue (pour artiste)
  ARTWORK_APPROVED   // Œuvre approuvée (pour artiste)
  ARTWORK_REJECTED   // Œuvre rejetée (pour artiste)
  NEW_MESSAGE        // Nouveau message
  PAYOUT_PROCESSED   // Paiement traité (pour artiste)
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String           @db.Text
  link      String?          // Lien vers la ressource concernée
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())
  
  @@index([userId, read])
  @@index([createdAt])
  @@map("notifications")
}

// ==========================================
// PARAMÈTRES GLOBAUX
// ==========================================

model Setting {
  id    String @id @default(cuid())
  key   String @unique
  value Json
  
  updatedAt DateTime @updatedAt
  
  @@map("settings")
}

// Exemples de settings :
// - commission_rate_default: 30
// - shipping_cost_default: 50
// - vat_rate: 20
// - gallery_info: {name, address, email, phone}
// - maintenance_mode: false
```

---

## 📈 Indexes et Optimisations

### Indexes principaux

```sql
-- Recherche rapide des œuvres
CREATE INDEX idx_artworks_search ON artworks USING GIN (to_tsvector('french', title || ' ' || description));

-- Filtre par prix
CREATE INDEX idx_artworks_price ON artworks(price) WHERE status = 'AVAILABLE';

-- Recherche par tags
CREATE INDEX idx_artworks_tags ON artworks USING GIN (tags);

-- Recherche par artiste
CREATE INDEX idx_artworks_artist_status ON artworks(artistId, status);
```

### Contraintes métier

```sql
-- Une œuvre ne peut être dans 2 commandes
-- (Géré par orderId unique dans Artwork)

-- Le total de la commande doit être positif
ALTER TABLE orders ADD CONSTRAINT check_total_positive CHECK (total > 0);

-- Le taux de commission doit être entre 0 et 100
ALTER TABLE artist_profiles ADD CONSTRAINT check_commission_rate CHECK (commissionRate >= 0 AND commissionRate <= 100);
```

---

## 🔄 Migrations importantes

### Migration initiale

```bash
# Créer la migration
npx prisma migrate dev --name init

# Appliquer en production
npx prisma migrate deploy
```

### Seeding (données initiales)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Créer admin par défaut
  const adminPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@galerie-elfakir.com',
      password: adminPassword,
      name: 'Admin Galerie',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
  })
  
  // Settings par défaut
  await prisma.setting.createMany({
    data: [
      { key: 'commission_rate_default', value: 30 },
      { key: 'shipping_cost_default', value: 50 },
      { key: 'vat_rate', value: 20 },
      { key: 'maintenance_mode', value: false },
    ],
  })
  
  console.log('✅ Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

```bash
# Exécuter le seed
npx prisma db seed
```

---

## 🔍 Requêtes utiles

### Récupérer œuvres disponibles avec artiste

```typescript
const artworks = await prisma.artwork.findMany({
  where: {
    status: 'AVAILABLE',
  },
  include: {
    artist: {
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    },
  },
  orderBy: {
    publishedAt: 'desc',
  },
})
```

### Statistiques artiste

```typescript
const stats = await prisma.artistProfile.findUnique({
  where: { userId: artistUserId },
  include: {
    artworks: {
      where: {
        status: 'SOLD',
      },
      select: {
        price: true,
        soldAt: true,
      },
    },
  },
})
```

### Recherche full-text

```typescript
const results = await prisma.artwork.findMany({
  where: {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { tags: { has: query } },
    ],
    status: 'AVAILABLE',
  },
})
```

---

## 🔐 Sécurité

### Row Level Security (RLS) simulé

```typescript
// Middleware Prisma pour filtrer selon le rôle
prisma.$use(async (params, next) => {
  if (params.model === 'Artwork' && params.action === 'findMany') {
    const user = getCurrentUser()
    
    if (user.role === 'ARTIST') {
      // Artiste ne voit que ses œuvres
      params.args.where = {
        ...params.args.where,
        artistId: user.artistProfile.id,
      }
    }
  }
  
  return next(params)
})
```

### Soft Delete

```typescript
// Ne jamais supprimer vraiment les users (RGPD)
model User {
  // ... autres champs
  status UserStatus
  deletedAt DateTime?
}

// Middleware pour exclure les users supprimés
prisma.$use(async (params, next) => {
  if (params.model === 'User') {
    if (params.action === 'findMany') {
      params.args.where = {
        ...params.args.where,
        status: { not: 'DELETED' },
      }
    }
  }
  
  return next(params)
})
```

---

## 📊 Vues utiles

### Vue œuvres avec statistiques

```sql
CREATE VIEW artwork_stats AS
SELECT 
  a.id,
  a.title,
  a.price,
  a.views,
  COUNT(f.id) as favorites_count,
  u.name as artist_name
FROM artworks a
LEFT JOIN favorites f ON f.artworkId = a.id
LEFT JOIN artist_profiles ap ON ap.id = a.artistId
LEFT JOIN users u ON u.id = ap.userId
GROUP BY a.id, u.name;
```

---

## 🎯 Points clés

1. **Stock unique** : Une œuvre = une commande maximum (orderId unique)
2. **Commissions** : Calculées automatiquement à chaque vente
3. **Stripe Connect** : Paiements directs aux artistes
4. **Soft delete** : Les données ne sont jamais vraiment supprimées (RGPD)
5. **Auditabilité** : Tous les models ont createdAt/updatedAt
6. **Snapshot** : Les infos de l'œuvre sont sauvegardées dans la commande (prix peut changer)

---

## 📚 Ressources

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [Neon Documentation](https://neon.tech/docs)
