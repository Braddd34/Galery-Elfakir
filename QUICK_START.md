# 🚀 Guide de Démarrage Rapide
## Galerie ELFAKIR - Installation en 10 minutes

---

## ⚡ Pour les débutants

Ce guide vous explique **étape par étape** comment démarrer le projet, même si vous êtes débutant. Chaque commande est expliquée simplement.

---

## 📋 Avant de commencer

### Ce dont vous avez besoin :

1. **Un ordinateur** (Mac, Windows ou Linux)
2. **Node.js installé** (c'est l'environnement pour exécuter JavaScript)
3. **Un éditeur de code** (VS Code recommandé - gratuit)
4. **Un terminal** (pour taper des commandes)

### Vérifier si Node.js est installé :

```bash
# Taper cette commande dans le terminal
node --version

# Si vous voyez "v18.x.x" ou "v20.x.x" → OK !
# Sinon, téléchargez Node.js sur nodejs.org
```

---

## 🎯 Installation en 5 étapes

### Étape 1 : Créer le projet (2 minutes)

**Ce que ça fait** : Crée un nouveau dossier avec tous les fichiers de base Next.js

```bash
# Copier-coller cette commande dans le terminal
npx create-next-app@latest galery-elfakir

# Répondez aux questions comme ceci :
# ✅ Would you like to use TypeScript? → Yes
# ✅ Would you like to use ESLint? → Yes
# ✅ Would you like to use Tailwind CSS? → Yes
# ✅ Would you like to use src/ directory? → No
# ✅ Would you like to use App Router? → Yes
# ✅ Would you like to customize the default import alias? → No

# Aller dans le dossier créé
cd galery-elfakir
```

**Explication** :
- `npx` : Outil pour exécuter des packages npm
- `create-next-app` : Créateur de projet Next.js officiel
- `galery-elfakir` : Nom de votre projet

---

### Étape 2 : Installer les outils nécessaires (3 minutes)

**Ce que ça fait** : Télécharge toutes les bibliothèques (packages) dont le projet a besoin

```bash
# BASE DE DONNÉES
npm install @prisma/client prisma

# AUTHENTIFICATION (connexion utilisateurs)
npm install next-auth bcrypt
npm install -D @types/bcrypt

# PAIEMENTS (Stripe)
npm install stripe

# UPLOAD IMAGES
npm install @vercel/blob

# EMAILS
npm install resend react-email

# FORMULAIRES (validation des données)
npm install zod react-hook-form @hookform/resolvers

# ÉTAT GLOBAL (partager des données entre pages)
npm install zustand

# INTERFACE UTILISATEUR (beaux composants)
npx shadcn-ui@latest init
# Appuyez sur "Entrée" pour toutes les questions (valeurs par défaut)

# PWA (application mobile)
npm install next-pwa

# UTILITAIRES
npm install date-fns
```

**Explication** :
- `npm install` : Commande pour télécharger un package
- `-D` : Package utilisé seulement en développement (pas en production)
- Chaque package = un outil pour une fonctionnalité précise

**Temps d'attente** : 2-3 minutes (téléchargement depuis Internet)

---

### Étape 3 : Configurer la base de données (3 minutes)

#### A. Créer un compte Neon (base de données gratuite)

1. **Ouvrir votre navigateur** → Aller sur [neon.tech](https://neon.tech)
2. **Cliquer** sur "Sign Up" (Créer un compte)
3. **S'inscrire** avec GitHub ou Google (le plus simple)
4. **Créer un nouveau projet** :
   - Nom : `galerie-elfakir`
   - Région : Europe (Paris ou Frankfurt)
5. **Copier la "Connection String"** (commence par `postgresql://`)

**Explication** : Neon est une base de données PostgreSQL dans le cloud (= sur Internet). C'est gratuit pour commencer et s'agrandit automatiquement si nécessaire.

#### B. Créer le fichier de configuration

```bash
# Dans le terminal, copier cette commande
npx prisma init
```

**Ce que ça fait** : Crée 2 fichiers :
- `prisma/schema.prisma` : Description de votre base de données
- `.env` : Fichier secret pour les mots de passe et clés API

#### C. Ajouter vos secrets

```bash
# Créer le fichier pour les secrets
touch .env.local

# Ouvrir le fichier dans VS Code
code .env.local
```

**Coller ce contenu** (remplacer les xxx par vos vraies valeurs) :

```bash
# ===== BASE DE DONNÉES =====
# Coller la connection string de Neon (étape 3A)
DATABASE_URL="postgresql://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require"

# ===== AUTHENTIFICATION =====
NEXTAUTH_URL="http://localhost:3000"
# Générer un secret : ouvrir terminal et taper : openssl rand -base64 32
NEXTAUTH_SECRET="collez-le-secret-genere-ici"

# ===== STRIPE (paiements) =====
# Pour l'instant, laisser vide (on configurera plus tard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# ===== VERCEL BLOB (images) =====
# Pour l'instant, laisser vide (on configurera plus tard)
BLOB_READ_WRITE_TOKEN=""

# ===== RESEND (emails) =====
# Pour l'instant, laisser vide (on configurera plus tard)
RESEND_API_KEY=""

# ===== URLS =====
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Explication** :
- `.env.local` : Fichier avec vos secrets (JAMAIS le partager !)
- `DATABASE_URL` : Adresse de votre base de données
- `NEXTAUTH_SECRET` : Code secret pour sécuriser les connexions
- Les autres clés seront ajoutées quand vous configurerez Stripe, etc.

#### D. Créer le schéma de la base de données

```bash
# Ouvrir le fichier schema.prisma
code prisma/schema.prisma
```

**Supprimer tout le contenu** et **coller le schéma complet** depuis le fichier `DATABASE_SCHEMA.md` (section "Schéma Prisma Complet").

**Ensuite, créer les tables** :

```bash
# Cette commande crée toutes les tables dans la base de données
npx prisma migrate dev --name init

# Attendre quelques secondes...
# ✅ Si vous voyez "Your database is now in sync" → Bravo !
```

**Explication** :
- `prisma migrate` : Crée les tables dans la base de données
- `--name init` : Nom de cette migration (= version de la DB)

---

### Étape 4 : Créer un compte administrateur (1 minute)

**Ce que ça fait** : Crée un utilisateur admin pour se connecter au site

```bash
# Créer un fichier pour initialiser la base
touch prisma/seed.ts

# Ouvrir le fichier
code prisma/seed.ts
```

**Coller ce code** :

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Créer un mot de passe hashé (sécurisé)
  const adminPassword = await bcrypt.hash('Admin123!', 12)
  
  // Créer l'utilisateur admin
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
  
  console.log('✅ Compte admin créé avec succès!')
  console.log('📧 Email:', admin.email)
  console.log('🔑 Mot de passe: Admin123!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Ajouter dans package.json** :

Ouvrir `package.json` et ajouter cette section :

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

**Installer ts-node** :

```bash
npm install -D ts-node
```

**Exécuter le seed** :

```bash
npx prisma db seed

# ✅ Vous devriez voir :
# ✅ Compte admin créé avec succès!
# 📧 Email: admin@galerie-elfakir.com
# 🔑 Mot de passe: Admin123!
```

**NOTEZ CES IDENTIFIANTS** (vous en aurez besoin pour vous connecter) !

---

### Étape 5 : Lancer le site (30 secondes)

```bash
# Démarrer le serveur de développement
npm run dev

# ✅ Vous devriez voir :
# - ready started server on 0.0.0.0:3000
# - ✓ Compiled in XXXms
```

**Ouvrir votre navigateur** → [http://localhost:3000](http://localhost:3000)

**🎉 BRAVO ! Votre site Next.js fonctionne !**

---

## 🎨 Prochaines étapes

Maintenant que le projet est installé, vous pouvez :

### 1. Créer la page d'accueil

```bash
# Ouvrir le fichier de la page d'accueil
code app/page.tsx
```

Remplacer le contenu par :

```typescript
export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">
          Galerie ELFAKIR
        </h1>
        <p className="text-xl text-gray-600">
          Découvrez des œuvres d'art originales
        </p>
      </div>
    </div>
  )
}
```

**Sauvegarder** et **rafraîchir le navigateur** → Vous verrez votre nouvelle page !

---

### 2. Explorer la base de données

```bash
# Ouvrir Prisma Studio (interface visuelle pour la DB)
npx prisma studio

# Ouvre automatiquement http://localhost:5555
```

**Ce que vous verrez** :
- Liste de toutes les tables (User, Artwork, Order, etc.)
- Possibilité d'ajouter/modifier/supprimer des données
- Interface intuitive (comme Excel)

---

### 3. Créer votre première page

```bash
# Créer un dossier pour le catalogue
mkdir -p app/catalogue

# Créer la page
touch app/catalogue/page.tsx
```

Ajouter ce code :

```typescript
export default function CataloguePage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Catalogue</h1>
      <p>Les œuvres apparaîtront ici...</p>
    </div>
  )
}
```

**Ouvrir** → [http://localhost:3000/catalogue](http://localhost:3000/catalogue)

---

## 🆘 Problèmes courants

### Erreur "Module not found"

**Problème** : Un package n'est pas installé

**Solution** :
```bash
# Réinstaller toutes les dépendances
npm install
```

---

### Erreur "Port 3000 already in use"

**Problème** : Le port 3000 est déjà utilisé par un autre programme

**Solution** :
```bash
# Arrêter le serveur (Ctrl+C dans le terminal)
# Relancer sur un autre port
npm run dev -- -p 3001

# Ouvrir http://localhost:3001
```

---

### Erreur de connexion à la base de données

**Problème** : `DATABASE_URL` mal configurée

**Solution** :
1. Vérifier que la connection string dans `.env.local` est correcte
2. Vérifier que vous avez bien copié TOUTE la connection string de Neon
3. Redémarrer le serveur (`Ctrl+C` puis `npm run dev`)

---

### Le site est blanc / ne charge pas

**Problème** : Erreur JavaScript

**Solution** :
1. Ouvrir la console du navigateur (F12)
2. Regarder les erreurs en rouge
3. Google l'erreur pour trouver la solution
4. Ou vérifier que vous avez bien suivi toutes les étapes

---

## 📚 Apprendre plus

### Tutoriels recommandés

1. **Next.js** : [nextjs.org/learn](https://nextjs.org/learn)
2. **Prisma** : [prisma.io/docs/getting-started](https://www.prisma.io/docs/getting-started)
3. **TypeScript** : [typescriptlang.org/docs](https://www.typescriptlang.org/docs/)
4. **Tailwind CSS** : [tailwindcss.com/docs](https://tailwindcss.com/docs)

### Concepts importants à comprendre

1. **Next.js App Router** : Comment fonctionnent les pages et le routing
2. **React Components** : Les briques de base de votre interface
3. **Prisma ORM** : Comment communiquer avec la base de données
4. **API Routes** : Comment créer des endpoints pour le backend

---

## ✅ Checklist de validation

Avant de continuer, vérifiez que :

- [ ] Le site s'affiche sur http://localhost:3000
- [ ] Prisma Studio fonctionne (npx prisma studio)
- [ ] Le compte admin existe dans la base
- [ ] Aucune erreur dans le terminal
- [ ] Le fichier `.env.local` existe avec vos secrets

---

## 🎯 Suite du développement

Maintenant que l'installation est terminée, consultez :

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** : Pour comprendre la structure complète
2. **[FLOWS_METIER.md](./FLOWS_METIER.md)** : Pour implémenter les fonctionnalités métier
3. **[PWA_CONFIGURATION.md](./PWA_CONFIGURATION.md)** : Pour transformer le site en app mobile

---

## 🎉 Félicitations !

Vous avez installé avec succès la base de votre galerie d'art en ligne !

**Prochaine étape** : Implémenter l'authentification (connexion/inscription)

**Bon développement ! 🚀**

---

## 📞 Besoin d'aide ?

Si vous êtes bloqué :

1. **Lire les messages d'erreur** (souvent ils expliquent le problème)
2. **Google l'erreur** (99% des erreurs ont déjà été résolues par d'autres)
3. **Consulter la documentation** des outils utilisés
4. **Demander de l'aide** sur des forums (Stack Overflow, Reddit, Discord Next.js)

**Important** : En développement, les erreurs sont normales ! Chaque erreur est une opportunité d'apprendre. 💪
