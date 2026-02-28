"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ProfilePhotoUpload from "@/components/profile/ProfilePhotoUpload"

interface ArtistProfile {
  bio: string
  country: string
  city: string
  website: string
  instagram: string
  phone: string
}

export default function ArtistProfilPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [profile, setProfile] = useState<ArtistProfile>({
    bio: "",
    country: "",
    city: "",
    website: "",
    instagram: "",
    phone: ""
  })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "ARTIST") {
      router.push("/dashboard")
      return
    }

    setProfileImage(session.user?.image || null)

    // Charger le profil
    fetch("/api/artist/profile")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setProfile({
            bio: data.bio || "",
            country: data.country || "",
            city: data.city || "",
            website: data.website || "",
            instagram: data.instagram || "",
            phone: data.phone || ""
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session, status, router])

  const handlePhotoChange = async (newImageUrl: string) => {
    setProfileImage(newImageUrl)
    await update({ image: newImageUrl })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const res = await fetch("/api/artist/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      })

      if (res.ok) {
        setMessage("Profil mis à jour avec succès")
      } else {
        setMessage("Erreur lors de la mise à jour")
      }
    } catch {
      setMessage("Erreur lors de la mise à jour")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-neutral-500">Chargement...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-xl tracking-[0.3em] font-light">
            ELFAKIR
          </Link>
          <Link href="/dashboard" className="text-neutral-400 hover:text-white text-sm">
            ← Retour au tableau de bord
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-8">Mon profil artiste</h1>

        {/* Photo de profil (affichée sur la page publique de l'artiste) */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 pb-10 border-b border-neutral-800">
          <ProfilePhotoUpload
            currentImage={profileImage}
            userName={session?.user?.name}
            onPhotoChange={handlePhotoChange}
          />
          <div className="text-center sm:text-left">
            <p className="text-neutral-500 text-sm">Cette photo apparaît sur votre page artiste publique.</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 border ${message.includes("succès") ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
              Biographie
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={5}
              className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none"
              placeholder="Parlez de vous, de votre démarche artistique..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                Pays
              </label>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                placeholder="France"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                Ville
              </label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                placeholder="Paris"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
              Site web
            </label>
            <input
              type="url"
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="https://votresite.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
              Instagram
            </label>
            <input
              type="text"
              value={profile.instagram}
              onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
              className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="@votrecompte"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-white text-black py-4 font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </main>
  )
}
