# Configuration PWA (Progressive Web App)
## Galerie ELFAKIR - Application Mobile Native

---

## 📱 Vue d'ensemble

Transformer le site Next.js en une véritable application mobile installable sur iOS et Android, offrant une expérience native avec :
- Installation sur l'écran d'accueil
- Fonctionnement hors ligne
- Notifications push
- Performances optimales
- Expérience utilisateur fluide

---

## 🛠️ Configuration complète

### 1. Manifest (app/manifest.ts)

```typescript
// app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Informations de base
    name: 'Galerie ELFAKIR - Art en Ligne',
    short_name: 'ELFAKIR',
    description: 'Découvrez et achetez des œuvres d\'art originales d\'artistes internationaux',
    
    // URLs
    start_url: '/',
    scope: '/',
    
    // Affichage
    display: 'standalone', // Options: fullscreen, standalone, minimal-ui, browser
    orientation: 'portrait-primary',
    
    // Couleurs
    theme_color: '#000000', // Couleur barre statut mobile
    background_color: '#ffffff', // Couleur splash screen
    
    // Icônes (différentes tailles)
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      // Maskable icons (Android adaptative)
      {
        src: '/icons/icon-192x192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-512x512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    
    // Screenshots (pour app stores)
    screenshots: [
      {
        src: '/screenshots/mobile-home.png',
        sizes: '1170x2532',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Page d\'accueil'
      },
      {
        src: '/screenshots/mobile-catalogue.png',
        sizes: '1170x2532',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Catalogue des œuvres'
      },
      {
        src: '/screenshots/mobile-detail.png',
        sizes: '1170x2532',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Détail d\'une œuvre'
      },
      {
        src: '/screenshots/desktop-home.png',
        sizes: '2560x1440',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Version desktop'
      }
    ],
    
    // Catégories (pour app stores)
    categories: ['shopping', 'lifestyle', 'entertainment'],
    
    // Préférences
    prefer_related_applications: false,
    
    // Raccourcis (menu contextuel)
    shortcuts: [
      {
        name: 'Catalogue',
        short_name: 'Catalogue',
        description: 'Voir toutes les œuvres',
        url: '/catalogue',
        icons: [{ src: '/icons/catalogue.png', sizes: '96x96' }]
      },
      {
        name: 'Favoris',
        short_name: 'Favoris',
        description: 'Mes œuvres favorites',
        url: '/favoris',
        icons: [{ src: '/icons/heart.png', sizes: '96x96' }]
      },
      {
        name: 'Mon compte',
        short_name: 'Compte',
        description: 'Accéder à mon compte',
        url: '/dashboard',
        icons: [{ src: '/icons/user.png', sizes: '96x96' }]
      }
    ]
  }
}
```

### 2. Metadata dans layout.tsx

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'Galerie ELFAKIR - Art en Ligne',
    template: '%s | Galerie ELFAKIR'
  },
  description: 'Découvrez et achetez des œuvres d\'art originales d\'artistes internationaux',
  applicationName: 'Galerie ELFAKIR',
  authors: [{ name: 'Galerie ELFAKIR' }],
  generator: 'Next.js',
  keywords: ['art', 'galerie', 'peinture', 'sculpture', 'artiste', 'œuvre', 'original'],
  referrer: 'origin-when-cross-origin',
  creator: 'Galerie ELFAKIR',
  publisher: 'Galerie ELFAKIR',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Galerie ELFAKIR',
    startupImage: [
      {
        url: '/splash/iphone5_splash.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splash/iphone6_splash.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splash/iphoneplus_splash.png',
        media: '(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splash/iphonex_splash.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splash/iphonexr_splash.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splash/iphonexsmax_splash.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splash/ipad_splash.png',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splash/ipadpro1_splash.png',
        media: '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splash/ipadpro3_splash.png',
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splash/ipadpro2_splash.png',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  
  formatDetection: {
    telephone: false,
  },
  
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://galerie-elfakir.com',
    siteName: 'Galerie ELFAKIR',
    title: 'Galerie ELFAKIR - Art en Ligne',
    description: 'Découvrez et achetez des œuvres d\'art originales',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Galerie ELFAKIR',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Galerie ELFAKIR',
    description: 'Découvrez et achetez des œuvres d\'art originales',
    images: ['/og-image.png'],
  },
}
```

---

## 🔧 Service Worker (Stratégie de cache)

### Installation avec Workbox

```bash
npm install workbox-webpack-plugin
```

### Configuration next.config.js

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 an
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 semaine
        }
      }
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 semaine
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24h
        }
      }
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24h
        }
      }
    },
    {
      urlPattern: /\.(?:mp3|wav|ogg)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-audio-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24h
        }
      }
    },
    {
      urlPattern: /\.(?:mp4)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-video-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24h
        }
      }
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24h
        }
      }
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24h
        }
      }
    },
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-data',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24h
        }
      }
    },
    {
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst',
      method: 'GET',
      options: {
        cacheName: 'apis',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60 // 24h
        },
        networkTimeoutSeconds: 10
      }
    },
    {
      urlPattern: /.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24h
        },
        networkTimeoutSeconds: 10
      }
    }
  ]
})

module.exports = withPWA({
  // Votre config Next.js
  reactStrictMode: true,
  swcMinify: true,
})
```

---

## 📲 Fonctionnalités PWA avancées

### 1. Installation Prompt

```typescript
// components/InstallPrompt.tsx
'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('✅ PWA installée')
    }

    setDeferredPrompt(null)
    setShowInstall(false)
  }

  if (!showInstall) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold">Installer l'application</h3>
          <p className="text-sm text-gray-300">
            Accédez rapidement à la galerie depuis votre écran d'accueil
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInstall(false)}
            className="px-4 py-2 text-gray-300"
          >
            Plus tard
          </button>
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-white text-black rounded"
          >
            Installer
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 2. Page Offline

```typescript
// app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Vous êtes hors ligne</h1>
        <p className="text-gray-600 mb-8">
          Vérifiez votre connexion internet pour accéder à toutes les fonctionnalités
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-black text-white rounded-lg"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
```

### 3. Détection Online/Offline

```typescript
// hooks/useOnlineStatus.ts
'use client'

import { useEffect, useState } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
```

### 4. Notifications Push

```typescript
// lib/push-notifications.ts
export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('❌ Push notifications non supportées')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    })

    // Envoyer subscription au serveur
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    })

    return subscription
  } catch (error) {
    console.error('❌ Erreur souscription push:', error)
    return null
  }
}
```

### 5. Background Sync (Favoris offline)

```typescript
// lib/background-sync.ts
export async function addToFavoritesOffline(artworkId: string) {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready
      
      // Sauvegarder localement
      await saveToIndexedDB('pending-favorites', { artworkId, timestamp: Date.now() })
      
      // Demander sync background
      await registration.sync.register('sync-favorites')
      
      console.log('✅ Favori sera synchronisé quand en ligne')
    } catch (error) {
      console.error('❌ Background sync failed:', error)
    }
  }
}
```

---

## 🎨 Génération des icônes

### Script automatique

```bash
# Installer sharp (manipulation images)
npm install -D sharp

# Créer script de génération
node scripts/generate-icons.js
```

```javascript
// scripts/generate-icons.js
const sharp = require('sharp')
const fs = require('fs')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const inputImage = './public/logo.png'

async function generateIcons() {
  // Créer dossier icons
  if (!fs.existsSync('./public/icons')) {
    fs.mkdirSync('./public/icons', { recursive: true })
  }

  for (const size of sizes) {
    // Icon normale
    await sharp(inputImage)
      .resize(size, size)
      .toFile(`./public/icons/icon-${size}x${size}.png`)
    
    console.log(`✅ Généré icon-${size}x${size}.png`)

    // Icon maskable (avec padding pour Android)
    if (size >= 192) {
      await sharp(inputImage)
        .resize(size * 0.8, size * 0.8)
        .extend({
          top: size * 0.1,
          bottom: size * 0.1,
          left: size * 0.1,
          right: size * 0.1,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .toFile(`./public/icons/icon-${size}x${size}-maskable.png`)
      
      console.log(`✅ Généré icon-${size}x${size}-maskable.png`)
    }
  }

  console.log('✅ Toutes les icônes ont été générées')
}

generateIcons()
```

---

## 🧪 Tests PWA

### Lighthouse (Google Chrome)

```bash
# Installer Lighthouse CLI
npm install -g lighthouse

# Tester PWA
lighthouse https://votre-domaine.com --view --preset=desktop
```

### Checklist PWA

- [ ] Manifest valide
- [ ] Service Worker enregistré
- [ ] HTTPS activé (obligatoire)
- [ ] Icons 192x192 et 512x512
- [ ] Splash screens iOS
- [ ] Responsive design
- [ ] Fast load time (< 3s)
- [ ] Works offline
- [ ] Installable

---

## 📊 Analytics PWA

### Tracking installation

```typescript
// lib/analytics.ts
export function trackPWAInstall() {
  window.addEventListener('appinstalled', () => {
    // Analytics (Google Analytics, Plausible, etc.)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'pwa_install', {
        event_category: 'engagement',
        event_label: 'PWA installée'
      })
    }
  })
}
```

---

## 🚀 Déploiement

### Vérification avant prod

```bash
# Build production
npm run build

# Vérifier PWA
npx lighthouse http://localhost:3000 --view

# Tester offline
# 1. Ouvrir Chrome DevTools
# 2. Network tab -> Offline checkbox
# 3. Recharger la page
```

### Configuration Vercel

```json
// vercel.json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/manifest.webmanifest",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

---

## 🎯 Résumé

Avec cette configuration, votre galerie devient une vraie application mobile :

✅ **Installation** : Ajout sur écran d'accueil iOS/Android  
✅ **Offline** : Fonctionne sans connexion  
✅ **Performance** : Chargement ultra-rapide  
✅ **Notifications** : Alertes nouvelles œuvres  
✅ **Native-like** : Expérience application native  

---

## 📚 Ressources

- [Next.js PWA](https://www.npmjs.com/package/next-pwa)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [MDN Service Workers](https://developer.mozilla.org/fr/docs/Web/API/Service_Worker_API)
