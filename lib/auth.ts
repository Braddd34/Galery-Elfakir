import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcrypt"
import prisma from "./prisma"
import { isTurnstileEnforced, verifyTurnstileToken } from "./turnstile"

const MAX_ATTEMPTS = 5
const LOCK_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Compte les tentatives échouées récentes pour une IP ou un email.
 * Utilise la base de données (Neon) pour persister entre les instances serverless Vercel.
 */
async function countRecentFailures(ip: string, email: string): Promise<number> {
  const since = new Date(Date.now() - LOCK_WINDOW_MS)
  return prisma.loginAttempt.count({
    where: {
      success: false,
      createdAt: { gte: since },
      OR: [{ ip }, { email }],
    },
  })
}

async function recordAttempt(ip: string, email: string, success: boolean): Promise<void> {
  await prisma.loginAttempt.create({
    data: { ip, email, success },
  })
}

/**
 * Nettoyage des anciennes entrées (> 1h) pour ne pas surcharger la table.
 * Appelé de manière non-bloquante après chaque login.
 */
function cleanupOldAttempts(): void {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  prisma.loginAttempt
    .deleteMany({ where: { createdAt: { lt: oneHourAgo } } })
    .catch(() => {})
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        turnstileToken: { label: "Turnstile", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis")
        }

        const email = credentials.email.toLowerCase().trim()

        const ip =
          (req?.headers?.["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          (req?.headers?.["x-real-ip"] as string) ||
          "unknown"

        if (isTurnstileEnforced()) {
          const tsToken =
            typeof credentials.turnstileToken === "string"
              ? credentials.turnstileToken
              : undefined
          const tsOk = await verifyTurnstileToken(tsToken, ip)
          if (!tsOk) {
            throw new Error("Vérification de sécurité échouée. Rechargez la page.")
          }
        }

        const failures = await countRecentFailures(ip, email)
        if (failures >= MAX_ATTEMPTS) {
          throw new Error("Trop de tentatives. Réessayez dans 15 minutes.")
        }

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user || !user.password) {
          await recordAttempt(ip, email, false)
          throw new Error("Identifiants incorrects")
        }

        if (user.status === "DELETED") throw new Error("Ce compte a été supprimé")
        if (user.status === "SUSPENDED") throw new Error("Ce compte est suspendu")
        if (user.status === "PENDING") throw new Error("Ce compte est en attente de validation")

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          await recordAttempt(ip, email, false)
          const remaining = MAX_ATTEMPTS - failures - 1
          if (remaining <= 2 && remaining > 0) {
            throw new Error(
              `Mot de passe incorrect. ${remaining} tentative${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}.`
            )
          }
          throw new Error("Identifiants incorrects")
        }

        await recordAttempt(ip, email, true)

        // Nettoyage en arrière-plan (non-bloquant)
        cleanupOldAttempts()

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
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
        session.user.role = token.userRole as "ADMIN" | "MANAGER" | "ARTIST" | "BUYER"
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
}
