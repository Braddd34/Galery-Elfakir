/**
 * Configuration Sentry côté navigateur (client) — Next.js 14.
 * Sur Next 14, c'est ce nom de fichier qui est attendu par withSentryConfig.
 */
import * as Sentry from "@sentry/nextjs"

// Diagnostic : log la valeur du DSN inlinée au build (à retirer ensuite)
if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.log("[Sentry diagnostic] DSN value:", JSON.stringify(process.env.NEXT_PUBLIC_SENTRY_DSN))
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,

  tracesSampleRate: 0.1,

  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  beforeSend(event) {
    if (event.request?.cookies) {
      delete event.request.cookies
    }
    if (event.request?.headers) {
      delete event.request.headers["authorization"]
      delete event.request.headers["cookie"]
    }
    return event
  },

  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    "Network request failed",
    "AbortError",
    "Non-Error promise rejection captured",
  ],
})
