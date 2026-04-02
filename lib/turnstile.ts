const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

/**
 * Vérifie un jeton Turnstile auprès de Cloudflare (côté serveur).
 * Retourne false si le secret n'est pas configuré et qu'on exige une vérif — l'appelant décide.
 */
export async function verifyTurnstileToken(
  token: string | undefined,
  remoteip: string | undefined
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim() || ""
  if (!secret) {
    return false
  }
  if (!token || typeof token !== "string") {
    return false
  }

  const body = new URLSearchParams({
    secret,
    response: token,
    ...(remoteip && remoteip !== "unknown" ? { remoteip } : {}),
  })

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}

export function isTurnstileEnforced(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim())
}
