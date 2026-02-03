# 🎨 Galerie ELFAKIR
## Plateforme E-commerce d'Art en Ligne

---

## 📖 Vue d'ensemble

Galerie d'art en ligne professionnelle permettant la vente d'œuvres originales uniques en mandat de vente. Site web moderne + Progressive Web App (PWA) pour une expérience mobile native.

### Caractéristiques principales

✅ **Multi-rôles** : Admin, Artistes, Acheteurs  
✅ **Œuvres uniques** : Stock = 1 par œuvre  
✅ **Paiements sécurisés** : Stripe + Stripe Connect  
✅ **PWA** : Application mobile installable  
✅ **Conforme RGPD** : Respect du droit européen  
✅ **Scalable** : Architecture serverless Vercel  

---

## 📂 Documentation

### Documents disponibles

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture technique complète
   - Stack technique détaillée
   - Structure du projet
   - Configuration Next.js, Prisma, Stripe
   - Optimisations SEO et performance

2. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Modèle de données
   - Schéma Prisma complet
   - Relations entre tables
   - Contraintes métier
   - Requêtes SQL utiles

3. **[PWA_CONFIGURATION.md](./PWA_CONFIGURATION.md)** - Configuration PWA
   - Manifest et Service Workers
   - Installation sur mobile
   - Fonctionnement offline
   - Notifications push

4. **[FLOWS_METIER.md](./FLOWS_METIER.md)** - Processus métier
   - Inscription utilisateurs
   - Gestion des œuvres
   - Parcours d'achat complet
   - Paiements et commissions

---

## 🚀 Installation et démarrage

### Prérequis

```bash
# Node.js version 18 ou supérieure
node --version  # v18.0.0 ou +

# npm ou yarn
npm --version
```

### Étape 1 : Créer le projet Next.js

```bash
# Créer le projet avec TypeScript et App Router
npx create-next-app@latest galery-elfakir

# Options à choisir :
# ✅ TypeScript
# ✅ ESLint
# ✅ Tailwind CSS
# ✅ src/ directory (Non)
# ✅ App Router (Oui)
# ✅ Import alias (Oui - @/*)

# Aller dans le dossier
cd galery-elfakir
```

### Étape 2 : Installer les dépendances

```bash
# Base de données et ORM
npm install @prisma/client
npm install -D prisma

# Authentification
npm install next-auth@beta
npm install bcrypt
npm install -D @types/bcrypt

# Paiements Stripe
npm install stripe

# Upload images (Vercel Blob)
npm install @vercel/blob

# Emails
npm install resend
npm install react-email @react-email/components

# Validation formulaires
npm install zod react-hook-form @hookform/resolvers

# State management
npm install zustand

# UI Components (Shadcn)
npx shadcn-ui@latest init

# PWA
npm install next-pwa

# Utils
npm install date-fns
```

### Étape 3 : Configurer la base de données (Neon)

#### A. Créer un compte Neon

1. Allez sur [neon.tech](https://neon.tech)
2. Créez un compte gratuit
3. Créez un nouveau projet "galerie-elfakir"
4. Copiez la connection string

#### B. Initialiser Prisma

```bash
# Initialiser Prisma
npx prisma init

# Cela crée :
# - prisma/schema.prisma
# - .env
```

#### C. Configurer .env.local

```bash
# Créer le fichier
cp .env .env.local
```

Ajouter dans `.env.local` :

```bash
# Database (Neon)
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-genere" # Générer avec: openssl rand -base64 32

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Vercel Blob (à obtenir après déploiement Vercel)
BLOB_READ_WRITE_TOKEN="vercel_blob_xxx"

# Resend (emails)
RESEND_API_KEY="re_xxx"

# URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### D. Copier le schéma Prisma

Copiez le contenu de `DATABASE_SCHEMA.md` (section "Schéma Prisma Complet") dans `prisma/schema.prisma`

#### E. Créer la base de données

```bash
# Créer les tables
npx prisma migrate dev --name init

# Ouvrir Prisma Studio (interface visuelle)
npx prisma studio
```

### Étape 4 : Configurer Stripe

#### A. Créer un compte Stripe

1. Allez sur [stripe.com](https://stripe.com)
2. Créez un compte
3. Mode test par défaut (parfait pour développement)

#### B. Récupérer les clés API

1. Dashboard Stripe → Developers → API keys
2. Copiez :
   - **Publishable key** (pk_test_xxx)
   - **Secret key** (sk_test_xxx)

#### C. Configurer les webhooks (pour plus tard)

Pour recevoir les notifications de paiement (sera fait lors du déploiement).

### Étape 5 : Structure du projet

Créez la structure de dossiers suivante :

```bash
mkdir -p app/{(public),(auth),(dashboard)}/
mkdir -p app/api/{auth,oeuvres,stripe,upload}
mkdir -p components/{ui,forms,cards,layouts}
mkdir -p lib/{validations}
mkdir -p public/{icons,splash,screenshots}
```

### Étape 6 : Lancer le serveur de développement

```bash
# Démarrer Next.js
npm run dev

# Ouvrir http://localhost:3000
```

---

## 🔑 Services à configurer

### 1. Vercel (Hébergement)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel
```

### 2. Neon (Base de données)

✅ **Déjà configuré** (étape 3)

Fonctionnalités :
- Auto-scaling
- Backups automatiques
- Branches de développement

### 3. Stripe (Paiements)

✅ **Déjà configuré** (étape 4)

À faire ensuite :
- Activer Stripe Connect (pour payer les artistes)
- Configurer webhooks en production

### 4. Resend (Emails)

1. Créer compte sur [resend.com](https://resend.com)
2. Ajouter votre domaine
3. Récupérer API key
4. Configurer dans `.env.local`

Templates d'emails à créer :
- Confirmation inscription
- Confirmation commande
- Œuvre vendue (artiste)
- Certificat d'authenticité

### 5. Vercel Blob (Images)

```bash
# Après déploiement sur Vercel :
# 1. Aller dans Settings → Stores
# 2. Créer un Blob Store
# 3. Copier le token dans .env
```

Alternative : Cloudinary ou AWS S3

---

## 👥 Créer un compte admin

```bash
# Créer un script de seed
touch prisma/seed.ts
```

Ajouter dans `prisma/seed.ts` :

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('Admin123!', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@galerie-elfakir.com' },
    update: {},
    create: {
      email: 'admin@galerie-elfakir.com',
      password: adminPassword,
      name: 'Admin Galerie',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
  })
  
  console.log('✅ Admin créé:', admin.email)
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

Ajouter dans `package.json` :

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Exécuter :

```bash
# Installer ts-node
npm install -D ts-node

# Exécuter le seed
npx prisma db seed

# Credentials admin :
# Email: admin@galerie-elfakir.com
# Password: Admin123!
```

---

## 📱 Tester la PWA

### En développement

1. Ouvrir Chrome DevTools
2. Application → Manifest : vérifier la configuration
3. Service Workers : vérifier l'enregistrement

### En production

1. Déployer sur Vercel
2. Ouvrir sur mobile (Chrome/Safari)
3. Menu → "Ajouter à l'écran d'accueil"
4. L'app s'installe comme une app native !

---

## 🧪 Tests recommandés

### Tests unitaires

```bash
# Installer Jest
npm install -D jest @testing-library/react @testing-library/jest-dom

# Installer Vitest (alternative moderne)
npm install -D vitest @vitejs/plugin-react
```

### Tests E2E

```bash
# Installer Playwright
npm install -D @playwright/test

# Initialiser
npx playwright install
```

---

## 🔒 Sécurité - Checklist

Avant de passer en production :

- [ ] Changer tous les secrets (`.env.local`)
- [ ] Activer HTTPS (automatique sur Vercel)
- [ ] Configurer CSP (Content Security Policy)
- [ ] Rate limiting sur les API
- [ ] Validation stricte des uploads
- [ ] Activer 2FA pour admin
- [ ] Scanner dépendances (`npm audit`)
- [ ] Tester les webhooks Stripe
- [ ] Configurer monitoring (Sentry)
- [ ] Banner cookies RGPD

---

## 📈 Performances - Checklist

- [ ] Optimiser images (Next/Image)
- [ ] Lazy loading components
- [ ] Code splitting
- [ ] Lighthouse score > 90
- [ ] Cache CDN configuré
- [ ] Database indexes optimisés
- [ ] Bundle size < 200kb

---

## 🌍 SEO - Checklist

- [ ] Metadata pages dynamiques
- [ ] Sitemap.xml généré
- [ ] Robots.txt configuré
- [ ] Structured data (Schema.org)
- [ ] OpenGraph images
- [ ] URLs canoniques
- [ ] Analytics installé

---

## 📊 Monitoring

### Services recommandés

1. **Sentry** : Tracking erreurs
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

2. **Vercel Analytics** : Déjà inclus
   
3. **Plausible Analytics** : Alternative RGPD-friendly à Google Analytics

---

## 🤝 Contribution

### Git workflow

```bash
# Initialiser git
git init
git add .
git commit -m "Initial commit"

# Ajouter remote
git remote add origin https://github.com/votre-username/galerie-elfakir.git
git push -u origin main
```

### Branches

- `main` : Production
- `develop` : Développement
- `feature/xxx` : Nouvelles fonctionnalités
- `fix/xxx` : Corrections bugs

---

## 📞 Support & Contact

Pour toute question sur l'architecture ou l'implémentation :

- 📧 Email : mehdi@galerie-elfakir.com
- 📚 Documentation : Consultez les fichiers MD dans ce dossier

---

## 🎯 Roadmap

### Phase 1 - MVP (Minimum Viable Product)
- [ ] Setup projet
- [ ] Authentification NextAuth
- [ ] CRUD œuvres basique
- [ ] Paiement Stripe simple
- [ ] Déploiement Vercel

### Phase 2 - Fonctionnalités avancées
- [ ] Stripe Connect (paiements artistes)
- [ ] PWA complète
- [ ] Notifications push
- [ ] Certificats authenticité
- [ ] Dashboard analytics

### Phase 3 - Optimisations
- [ ] Performance (Lighthouse 95+)
- [ ] SEO international
- [ ] A/B testing
- [ ] Marketing automation
- [ ] App mobile native (optionnel)

---

## 📜 Licence

Ce projet est privé et propriétaire de Galerie ELFAKIR.

---

## 🙏 Remerciements

Merci d'utiliser cette architecture pour votre galerie d'art en ligne !

**Stack technique :**
- Next.js 15
- Prisma + Neon PostgreSQL
- NextAuth.js
- Stripe
- Vercel

**Architecture conçue pour être :**
- 🚀 Performante
- 🔒 Sécurisée
- 📱 Mobile-first
- 🌍 SEO-optimisée
- ♿ Accessible
- 🇪🇺 Conforme RGPD

---

**Bonne chance pour votre projet ! 🎨**
# Auto-deploy test
