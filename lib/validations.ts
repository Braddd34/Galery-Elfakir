import { z } from "zod"

// ==========================================
// AUTHENTIFICATION
// ==========================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z
    .string()
    .min(1, "Confirmez votre mot de passe"),
  role: z.enum(["BUYER", "ARTIST"]).optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
})

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z
    .string()
    .min(1, "Confirmez votre mot de passe")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
})

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Le mot de passe actuel est requis"),
  newPassword: z
    .string()
    .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z
    .string()
    .min(1, "Confirmez votre nouveau mot de passe")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
})

// ==========================================
// CONTACT
// ==========================================

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
  subject: z
    .string()
    .min(5, "Le sujet doit contenir au moins 5 caractères")
    .max(100, "Le sujet ne peut pas dépasser 100 caractères"),
  message: z
    .string()
    .min(20, "Le message doit contenir au moins 20 caractères")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères")
})

// ==========================================
// PROFILS
// ==========================================

export const buyerProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .optional()
    .or(z.literal("")),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(200, "L'adresse ne peut pas dépasser 200 caractères")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .max(100, "La ville ne peut pas dépasser 100 caractères")
    .optional()
    .or(z.literal("")),
  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, "Code postal invalide (5 chiffres)")
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .max(50, "Le pays ne peut pas dépasser 50 caractères")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^(\+33|0)[0-9]{9}$/, "Numéro de téléphone invalide")
    .optional()
    .or(z.literal(""))
})

export const artistProfileSchema = z.object({
  bio: z
    .string()
    .min(50, "La biographie doit contenir au moins 50 caractères")
    .max(2000, "La biographie ne peut pas dépasser 2000 caractères")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .max(100, "La ville ne peut pas dépasser 100 caractères")
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .max(50, "Le pays ne peut pas dépasser 50 caractères")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("URL invalide")
    .optional()
    .or(z.literal("")),
  instagram: z
    .string()
    .regex(/^@?[a-zA-Z0-9._]{1,30}$/, "Nom d'utilisateur Instagram invalide")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^(\+33|0)[0-9]{9}$/, "Numéro de téléphone invalide")
    .optional()
    .or(z.literal(""))
})

// ==========================================
// ŒUVRES
// ==========================================

export const artworkSchema = z.object({
  title: z
    .string()
    .min(2, "Le titre doit contenir au moins 2 caractères")
    .max(100, "Le titre ne peut pas dépasser 100 caractères"),
  description: z
    .string()
    .min(50, "La description doit contenir au moins 50 caractères")
    .max(3000, "La description ne peut pas dépasser 3000 caractères"),
  category: z.enum([
    "PAINTING", "SCULPTURE", "PHOTOGRAPHY", "DRAWING", 
    "PRINT", "DIGITAL", "MIXED_MEDIA", "OTHER"
  ], { errorMap: () => ({ message: "Catégorie invalide" }) }),
  year: z
    .number()
    .min(1900, "L'année doit être supérieure à 1900")
    .max(new Date().getFullYear(), "L'année ne peut pas être dans le futur"),
  width: z
    .number()
    .min(1, "La largeur doit être supérieure à 0")
    .max(10000, "Dimension trop grande"),
  height: z
    .number()
    .min(1, "La hauteur doit être supérieure à 0")
    .max(10000, "Dimension trop grande"),
  depth: z
    .number()
    .min(0, "La profondeur ne peut pas être négative")
    .max(10000, "Dimension trop grande")
    .optional()
    .nullable(),
  medium: z
    .string()
    .min(3, "La technique doit contenir au moins 3 caractères")
    .max(100, "La technique ne peut pas dépasser 100 caractères"),
  price: z
    .number()
    .min(1, "Le prix doit être supérieur à 0")
    .max(10000000, "Prix trop élevé")
})

// ==========================================
// NEWSLETTER
// ==========================================

export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
})

// ==========================================
// TYPES EXPORTS
// ==========================================

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type BuyerProfileInput = z.infer<typeof buyerProfileSchema>
export type ArtistProfileInput = z.infer<typeof artistProfileSchema>
export type ArtworkInput = z.infer<typeof artworkSchema>
export type NewsletterInput = z.infer<typeof newsletterSchema>
