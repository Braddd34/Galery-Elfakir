import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcrypt"
import prisma from "./prisma"

/**
 * Protection anti-brute-force sur le login.
 * 
 * Mécanisme : on stocke en mémoire le nombre de tentatives échouées par email.
 * Après 5 échecs, le compte est verrouillé pendant 15 minutes.
 * Le compteur se réinitialise après un login réussi ou l'expiration du délai.
 */
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>()

const MAX_ATTEMPTS = 5           // Nombre max de tentatives avant blocage
const LOCK_DURATION = 15 * 60 * 1000  // 15 minutes de verrouillage

// Nettoyage automatique des entrées expirées (toutes les 5 minutes)
setInterval(() => {
  const now = Date.now()
  const entries = Array.from(loginAttempts.entries())
  for (let i = 0; i < entries.length; i++) {
    if (now > entries[i][1].lockedUntil) {
      loginAttempts.delete(entries[i][0])
    }
  }
}, 5 * 60 * 1000)

function recordFailedAttempt(email: string): void {
  const existing = loginAttempts.get(email)
  const now = Date.now()
  
  if (existing && now < existing.lockedUntil) {
    // Déjà verrouillé, incrémenter le compteur
    existing.count++
    loginAttempts.set(email, existing)
  } else {
    // Nouvelle série de tentatives
    const count = (existing && now < existing.lockedUntil) ? existing.count + 1 : (existing ? existing.count + 1 : 1)
    loginAttempts.set(email, {
      count: existing ? existing.count + 1 : 1,
      lockedUntil: now + LOCK_DURATION
    })
  }
  
  // Si on atteint le max, définir le verrou
  const current = loginAttempts.get(email)!
  if (current.count >= MAX_ATTEMPTS) {
    current.lockedUntil = Date.now() + LOCK_DURATION
    loginAttempts.set(email, current)
  }
}

function isAccountLocked(email: string): boolean {
  const data = loginAttempts.get(email)
  if (!data) return false
  
  if (data.count >= MAX_ATTEMPTS && Date.now() < data.lockedUntil) {
    return true
  }
  
  // Si le verrou a expiré, réinitialiser
  if (Date.now() >= data.lockedUntil) {
    loginAttempts.delete(email)
    return false
  }
  
  return false
}

function clearAttempts(email: string): void {
  loginAttempts.delete(email)
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis")
        }

        const email = credentials.email.toLowerCase().trim()

        // Vérifier si le compte est verrouillé (anti-brute-force)
        if (isAccountLocked(email)) {
          throw new Error("Trop de tentatives. Compte verrouillé pendant 15 minutes.")
        }

        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user || !user.password) {
          // On enregistre quand même la tentative échouée
          recordFailedAttempt(email)
          throw new Error("Identifiants incorrects")
        }

        if (user.status === "DELETED") {
          throw new Error("Ce compte a été supprimé")
        }

        if (user.status === "SUSPENDED") {
          throw new Error("Ce compte est suspendu")
        }

        if (user.status === "PENDING") {
          throw new Error("Ce compte est en attente de validation")
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          recordFailedAttempt(email)
          
          // Compter les tentatives restantes pour donner un indice
          const attempts = loginAttempts.get(email)
          const remaining = MAX_ATTEMPTS - (attempts?.count || 0)
          
          if (remaining <= 2 && remaining > 0) {
            throw new Error(`Mot de passe incorrect. ${remaining} tentative${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}.`)
          }
          
          throw new Error("Identifiants incorrects")
        }

        // Login réussi : réinitialiser le compteur de tentatives
        clearAttempts(email)

        // Mettre à jour la date de dernière connexion
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      }
    })
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
        token.userRole = (user as any).role
      }
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string
        session.user.role = token.userRole as "ADMIN" | "ARTIST" | "BUYER"
      }
      return session
    }
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
}
