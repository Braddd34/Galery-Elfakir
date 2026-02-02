# Architecture Galerie d'Art ELFAKIR
## Plateforme E-commerce Culturelle Professionnelle

---

## 📋 Vue d'ensemble

Galerie d'art en ligne professionnelle avec site web et application mobile (PWA) pour la vente d'œuvres originales uniques en mandat de vente.

---

## 🏗️ Stack Technique Complète

### Frontend & Application
- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS + Shadcn/ui (composants modernes)
- **State Management** : Zustand (léger et performant)
- **Formulaires** : React Hook Form + Zod (validation)
- **Images** : Next/Image (optimisation automatique)

### Backend
- **API** : Next.js API Routes (App Router)
- **Functions** : Vercel Functions (serverless)
- **Edge** : Vercel Edge Functions (pour performances critiques)
- **Webhooks** : Gestion Stripe + notifications

### Base de données
- **Database** : Neon PostgreSQL (serverless, auto-scaling)
- **ORM** : Prisma (gestion simple du schéma et migrations)
- **Backup** : Automatique via Neon (Point-in-Time Recovery)
- **Connection Pooling** : PgBouncer intégré (Neon)

### Authentification & Autorisation
- **Solution recommandée** : NextAuth.js v5 (Auth.js)
- **Providers** :
  - Email/Password (bcrypt)
  - Google OAuth
  - Magic Links (email sans mot de passe)
- **Sessions** : JWT + base de données
- **Rôles** : ADMIN, ARTIST, BUYER (dans DB)
- **MFA** : Option 2FA pour Admin

### Paiements
- **Plateforme** : Stripe
- **Produits** :
  - Stripe Checkout (expérience hébergée)
  - Stripe Connect (paiements aux artistes)
  - Payment Intents (3D Secure)
- **Webhooks** : Gestion événements paiement
- **Conformité** : PCI DSS (géré par Stripe)

### Stockage & Médias
- **Solution recommandée** : Vercel Blob Storage
- **Alternatives** : Cloudinary / AWS S3 + CloudFront
- **Fonctionnalités** :
  - Upload direct depuis formulaires
  - Optimisation images automatique
  - Multiple résolutions (thumbnails, medium, full)
  - Protection CDN (signed URLs)
  - Watermark optionnel

### Emails Transactionnels
- **Solution recommandée** : Resend
- **Alternatives** : SendGrid / Amazon SES
- **Templates** :
  - React Email (composants réutilisables)
  - Confirmations commande
  - Notifications artistes
  - Certificats authenticité
  - Suivi livraison

### Monitoring & Analytics
- **Erreurs** : Sentry (tracking bugs)
- **Analytics** : Vercel Analytics + Plausible (RGPD-friendly)
- **Performance** : Vercel Speed Insights
- **Uptime** : Vercel Status
- **Logs** : Vercel Logs + Axiom

### SEO & Performance
- **Metadata** : Next.js Metadata API
- **Sitemap** : Génération automatique
- **Robots.txt** : Configuration SEO
- **OpenGraph** : Images et descriptions
- **Structured Data** : Schema.org (Product, ArtObject)
- **PWA** : Manifest + Service Workers

---

## 🎨 Architecture Frontend

### Structure des dossiers Next.js

```
galery-elfakir/
├── app/                          # App Router Next.js
│   ├── (public)/                 # Routes publiques
│   │   ├── page.tsx              # Page d'accueil
│   │   ├── catalogue/            # Liste des œuvres
│   │   ├── oeuvre/[id]/          # Détail d'une œuvre
│   │   └── artiste/[id]/         # Profil artiste
│   ├── (auth)/                   # Routes authentification
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/              # Routes protégées
│   │   ├── admin/                # Dashboard admin
│   │   ├── artiste/              # Dashboard artiste
│   │   └── acheteur/             # Dashboard acheteur
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/   # NextAuth
│   │   ├── oeuvres/              # CRUD œuvres
│   │   ├── stripe/               # Webhooks Stripe
│   │   └── upload/               # Upload images
│   ├── layout.tsx                # Layout global
│   └── manifest.ts               # PWA Manifest
├── components/                   # Composants réutilisables
│   ├── ui/                       # Composants UI (Shadcn)
│   ├── forms/                    # Formulaires
│   ├── cards/                    # Cards œuvres/artistes
│   └── layouts/                  # Layouts spécifiques
├── lib/                          # Utilitaires
│   ├── prisma.ts                 # Client Prisma
│   ├── auth.ts                   # Config NextAuth
│   ├── stripe.ts                 # Client Stripe
│   └── validations/              # Schémas Zod
├── prisma/                       # Base de données
│   ├── schema.prisma             # Schéma DB
│   └── migrations/               # Migrations
├── public/                       # Assets statiques
│   ├── icons/                    # Icons PWA
│   └── images/                   # Images statiques
└── middleware.ts                 # Protection routes
```

### Pages principales

#### Pages publiques
1. **Accueil** : Hero, œuvres mises en avant, artistes
2. **Catalogue** : Filtres (artiste, prix, style, dimensions)
3. **Détail œuvre** : Photos, description, artiste, achat
4. **Profil artiste** : Bio, œuvres, contact
5. **À propos** : Histoire galerie, mission
6. **Contact** : Formulaire contact

#### Pages authentifiées
1. **Dashboard Admin** :
   - Gestion œuvres (validation, publication)
   - Gestion artistes (validation, commissions)
   - Gestion commandes
   - Statistiques ventes
   
2. **Dashboard Artiste** :
   - Mes œuvres (ajout, édition)
   - Mes ventes
   - Mes revenus
   - Profil

3. **Dashboard Acheteur** :
   - Mes commandes
   - Mes favoris
   - Profil

---

## 🔐 Architecture de Sécurité

### Authentification (NextAuth.js)

```typescript
// Configuration NextAuth
- JWT Sessions (Edge-compatible)
- Refresh tokens (sécurité renforcée)
- Rate limiting (protection brute force)
- CSRF Protection (automatique)
- Secure cookies (httpOnly, sameSite)
```

### Autorisation (RBAC)

```typescript
// Rôles et permissions
enum UserRole {
  ADMIN    // Tout accès
  ARTIST   // Gestion ses œuvres
  BUYER    // Achat uniquement
}

// Middleware protection
- Routes protégées par rôle
- Vérification ownership (artiste/œuvre)
- Guards API (validation JWT)
```

### Sécurité données

1. **Validation** :
   - Zod (validation côté client/serveur)
   - Sanitization (prévention XSS)
   - Rate limiting (DDoS protection)

2. **Encryption** :
   - Mots de passe : bcrypt (12 rounds)
   - Données sensibles : chiffrement AES-256
   - Connexions : HTTPS only (Vercel)

3. **RGPD** :
   - Consentement cookies (Banner)
   - Export données utilisateur
   - Suppression compte (anonymisation)
   - Privacy Policy
   - CGV spécifiques art

---

## 💳 Flow de Vente Complet

### 1. Publication œuvre (Artiste)

```
Artiste → Ajoute œuvre → Admin valide → Publication catalogue
```

**Données requises** :
- Titre, description
- Prix (négocié avec admin)
- Photos (minimum 3)
- Dimensions, technique
- Certificat authenticité (PDF)
- Année création

### 2. Parcours achat (Client)

```
Catalogue → Détail œuvre → Ajout panier → Checkout Stripe → Paiement
→ Confirmation → Email confirmation → Préparation envoi
```

**Étapes techniques** :
1. Client clique "Acheter"
2. Vérification disponibilité (stock = 1)
3. Création session Stripe Checkout
4. Redirection Stripe (paiement sécurisé)
5. Webhook confirmation paiement
6. Mise à jour statut commande
7. Email confirmation client + artiste
8. Génération certificat authenticité
9. Notification admin (préparation envoi)

### 3. Paiement et commissions

```typescript
// Calcul automatique
Prix œuvre : 1000€
Commission galerie : 30% → 300€
Reversement artiste : 70% → 700€

// Stripe Connect
- Paiement galerie (account principal)
- Transfert automatique artiste (connected account)
- Gestion taxes (Stripe Tax)
```

### 4. Gestion stock unique

```typescript
// Transaction atomique (Prisma)
const vente = await prisma.$transaction(async (tx) => {
  // 1. Vérifier disponibilité
  const oeuvre = await tx.oeuvre.findUnique({
    where: { id, status: 'AVAILABLE' }
  })
  
  if (!oeuvre) throw new Error('Œuvre indisponible')
  
  // 2. Créer commande
  const order = await tx.order.create({ ... })
  
  // 3. Marquer vendu
  await tx.oeuvre.update({
    where: { id },
    data: { status: 'SOLD', soldAt: new Date() }
  })
  
  return order
})
```

---

## 📱 Configuration PWA

### Manifest (app/manifest.ts)

```typescript
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Galerie ELFAKIR',
    short_name: 'ELFAKIR',
    description: 'Galerie d\'art en ligne - Œuvres originales',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    categories: ['shopping', 'lifestyle'],
    screenshots: [
      {
        src: '/screenshots/mobile-1.png',
        sizes: '1170x2532',
        type: 'image/png',
        form_factor: 'narrow'
      }
    ]
  }
}
```

### Service Worker

```typescript
// public/sw.js
// Stratégie de cache
const CACHE_NAME = 'galerie-v1'
const urlsToCache = [
  '/',
  '/catalogue',
  '/offline'
]

// Cache-first pour images
// Network-first pour API
// Fallback offline page
```

### Fonctionnalités PWA

1. **Installation** : Add to Home Screen
2. **Offline** : Cache pages consultées
3. **Notifications** : Push notifications (nouvelles œuvres)
4. **Sync** : Background sync (favoris)
5. **Share** : Web Share API (partage œuvres)

---

## 🚀 Performance & SEO

### Optimisations Next.js

```typescript
// next.config.js
{
  images: {
    domains: ['blob.vercel-storage.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  experimental: {
    ppr: true,              // Partial Prerendering
    reactCompiler: true,    // React Compiler
  }
}
```

### Stratégies de rendu

1. **Pages statiques** (SSG) :
   - Page d'accueil
   - Pages légales
   - Profils artistes

2. **Pages dynamiques** (ISR) :
   - Catalogue (revalidate: 60s)
   - Détail œuvre (revalidate: 30s)

3. **Pages temps réel** (SSR) :
   - Dashboards
   - Panier
   - Checkout

### SEO

```typescript
// Metadata dynamique
export async function generateMetadata({ params }): Promise<Metadata> {
  const oeuvre = await getOeuvre(params.id)
  
  return {
    title: `${oeuvre.titre} - ${oeuvre.artiste.nom}`,
    description: oeuvre.description,
    openGraph: {
      title: oeuvre.titre,
      description: oeuvre.description,
      images: [oeuvre.image],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
    }
  }
}
```

### Structured Data (Schema.org)

```typescript
// JSON-LD pour Google Rich Results
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Titre œuvre",
  "image": ["url1", "url2"],
  "description": "Description",
  "brand": {
    "@type": "Person",
    "name": "Nom artiste"
  },
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "price": "1000",
    "priceCurrency": "EUR"
  }
}
```

---

## 📊 Scalabilité

### Infrastructure Vercel

```yaml
Architecture Serverless:
  - Functions: Auto-scaling illimité
  - Edge Network: 100+ regions
  - CDN: Global distribution
  - Database: Neon auto-scaling (0-100+ GB)
```

### Optimisations

1. **Caching** :
   - Edge caching (Vercel CDN)
   - Redis (Upstash) pour sessions
   - React Query (cache client)

2. **Database** :
   - Indexes optimisés
   - Connection pooling
   - Query optimization

3. **Images** :
   - Lazy loading
   - Responsive images
   - CDN distribution
   - Format moderne (AVIF/WebP)

### Monitoring performances

```typescript
// Vercel Speed Insights
import { SpeedInsights } from '@vercel/speed-insights/next'

// Core Web Vitals tracking
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1
```

---

## 📝 Configuration initiale

### 1. Variables d'environnement

```bash
# .env.local
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

NEXTAUTH_URL="https://votre-domaine.com"
NEXTAUTH_SECRET="..."

STRIPE_PUBLIC_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

BLOB_READ_WRITE_TOKEN="..."

RESEND_API_KEY="re_..."
```

### 2. Installation

```bash
npx create-next-app@latest galery-elfakir
cd galery-elfakir
npm install prisma @prisma/client
npm install next-auth stripe
npm install @vercel/blob resend
npm install react-email
npm install zustand zod react-hook-form
```

### 3. Déploiement Vercel

```bash
# Installation Vercel CLI
npm i -g vercel

# Connexion
vercel login

# Déploiement
vercel --prod
```

---

## 🎯 Prochaines étapes

1. ✅ Initialiser projet Next.js
2. ✅ Configurer Prisma + Neon
3. ✅ Implémenter authentification NextAuth
4. ✅ Créer schéma base de données
5. ✅ Configurer Stripe + webhooks
6. ✅ Développer pages principales
7. ✅ Implémenter PWA
8. ✅ Tests et optimisations
9. ✅ Déploiement production

---

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [NextAuth.js](https://next-auth.js.org)

---

**Architecture conçue pour être :**
- ✅ Professionnelle et scalable
- ✅ Performante et SEO-friendly
- ✅ Sécurisée et conforme RGPD
- ✅ Simple à maintenir (débutant-friendly)
- ✅ Prête pour le marché international
