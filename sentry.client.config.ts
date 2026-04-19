/**
 * Configuration Sentry côté navigateur (client).
 * Capturé : erreurs JavaScript, promesses rejetées, performance des pages.
 */
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
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
