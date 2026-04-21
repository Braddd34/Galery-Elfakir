import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/cron/backup-snapshot
 * Cron Vercel quotidien (3h30 du matin).
 *
 * Crée une branche Neon "auto-backup-YYYY-MM-DD" qui sert de snapshot
 * de la base de données au moment de l'exécution.
 *
 * Conserve les 7 derniers snapshots (supprime les plus anciens),
 * pour rester sous la limite de 10 branches du plan Free Neon.
 *
 * Sécurisé par le header Authorization Bearer CRON_SECRET
 * (fourni automatiquement par Vercel pour les crons).
 *
 * Variables d'environnement requises :
 * - NEON_API_KEY      : clé API Neon (https://console.neon.tech/app/settings/api-keys)
 * - NEON_PROJECT_ID   : id du projet Neon (visible dans l'URL ou Settings → General)
 * - CRON_SECRET       : secret partagé pour autoriser l'appel
 */

const NEON_API_BASE = "https://console.neon.tech/api/v2"
const BACKUP_PREFIX = "auto-backup-"
const MAX_BACKUPS = 7

type NeonBranch = {
  id: string
  name: string
  created_at: string
}

async function neonFetch(path: string, init?: RequestInit) {
  const apiKey = process.env.NEON_API_KEY
  if (!apiKey) throw new Error("NEON_API_KEY manquant")

  const res = await fetch(`${NEON_API_BASE}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(init?.headers || {}),
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Neon API ${path} → ${res.status} : ${text}`)
  }

  return res.json()
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET?.trim()

  if (process.env.NODE_ENV === "production") {
    if (!cronSecret) {
      return NextResponse.json(
        { error: "Cron non configuré (CRON_SECRET manquant)" },
        { status: 503 }
      )
    }
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
  } else if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const projectId = process.env.NEON_PROJECT_ID
  if (!projectId) {
    return NextResponse.json(
      { error: "NEON_PROJECT_ID manquant" },
      { status: 503 }
    )
  }

  try {
    const today = new Date().toISOString().slice(0, 10)
    const newBranchName = `${BACKUP_PREFIX}${today}`

    const listRes = await neonFetch(`/projects/${projectId}/branches`)
    const branches = (listRes.branches || []) as NeonBranch[]

    const autoBackups = branches
      .filter(b => b.name.startsWith(BACKUP_PREFIX))
      .sort((a, b) => a.created_at.localeCompare(b.created_at))

    const alreadyExists = autoBackups.some(b => b.name === newBranchName)
    if (alreadyExists) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: `Snapshot ${newBranchName} déjà existant aujourd'hui`,
        backupsKept: autoBackups.length,
      })
    }

    const deleted: string[] = []
    while (autoBackups.length >= MAX_BACKUPS) {
      const oldest = autoBackups.shift()
      if (!oldest) break
      await neonFetch(`/projects/${projectId}/branches/${oldest.id}`, {
        method: "DELETE",
      })
      deleted.push(oldest.name)
    }

    const created = await neonFetch(`/projects/${projectId}/branches`, {
      method: "POST",
      body: JSON.stringify({
        branch: { name: newBranchName },
      }),
    })

    return NextResponse.json({
      success: true,
      created: newBranchName,
      createdId: created?.branch?.id,
      deleted,
      backupsKept: autoBackups.length + 1,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue"
    console.error("Cron backup-snapshot:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
