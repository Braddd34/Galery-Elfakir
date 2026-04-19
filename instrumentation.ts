/**
 * Instrumentation Next.js — chargée avant tout le reste.
 * Permet à Sentry d'intercepter les erreurs côté serveur et edge.
 * Documentation : https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config")
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config")
  }
}
