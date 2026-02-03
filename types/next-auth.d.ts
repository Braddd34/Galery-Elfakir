import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "ARTIST" | "BUYER"
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: "ADMIN" | "ARTIST" | "BUYER"
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role: "ADMIN" | "ARTIST" | "BUYER"
  }
}
