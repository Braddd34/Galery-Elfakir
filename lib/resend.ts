import { Resend } from 'resend'

// Client Resend pour l'envoi d'emails
// Assurez-vous d'avoir RESEND_API_KEY dans vos variables d'environnement
export const resend = new Resend(process.env.RESEND_API_KEY)

// Adresse email d'envoi (doit être vérifiée dans Resend)
// En mode développement, utilisez onboarding@resend.dev
export const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'
export const FROM_NAME = 'Galerie ELFAKIR'
