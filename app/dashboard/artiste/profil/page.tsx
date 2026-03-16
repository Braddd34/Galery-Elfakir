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
  twitter: string
  facebook: string
  linkedin: string
  siret: string
  vatNumber: string
}

export default function ArtistProfilPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [profileId, setProfileId] = useState<string | null>(null)
  const [profile, setProfile] = useState<ArtistProfile>({
    bio: "",
    country: "",
    city: "",
    website: "",
    instagram: "",
    phone: "",
    twitter: "",
    facebook: "",
    linkedin: "",
    siret: "",
    vatNumber: ""
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
          if (data.id) setProfileId(data.id)
          setProfile({
            bio: data.bio || "",
            country: data.country || "",
            city: data.city || "",
            website: data.website || "",
            instagram: data.instagram || "",
            phone: data.phone || "",
            twitter: data.twitter || "",
            facebook: data.facebook || "",
            linkedin: data.linkedin || "",
            siret: data.siret || "",
            vatNumber: data.vatNumber || ""
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
        const data = await res.json().catch(() => ({}))
        setMessage(data.error || "Erreur lors de la mise à jour")
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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-light">Mon profil artiste</h1>
          {profileId && (
            <Link
              href={`/artiste/${profileId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-neutral-400 hover:text-white border border-neutral-700 hover:border-white px-4 py-2 transition-colors"
            >
              Voir ma page publique →
            </Link>
          )}
        </div>

        {message && (
          <div className={`mb-6 p-4 border ${message.includes("succès") ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section Présentation */}
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-800 pb-2">
              Présentation
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ProfilePhotoUpload
                currentImage={profileImage}
                userName={session?.user?.name}
                onPhotoChange={handlePhotoChange}
              />
              <div className="text-center sm:text-left">
                <p className="text-neutral-500 text-sm">Cette photo apparaît sur votre page artiste publique.</p>
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                Biographie <span className="font-normal text-neutral-600">(min. 20 caractères)</span>
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={5}
                maxLength={2000}
                className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none"
                placeholder="Parlez de vous, de votre démarche artistique..."
              />
              <p className="text-right text-neutral-600 text-xs mt-1">
                {profile.bio.length} / 2000
              </p>
            </div>
          </section>

          {/* Section Contact et réseaux */}
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-800 pb-2">
              Contact et réseaux
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Pays</label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="France"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Ville</label>
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
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Site web</label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                placeholder="https://votresite.com"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Instagram</label>
                <input
                  type="text"
                  value={profile.instagram}
                  onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                  className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="@votrecompte"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Twitter / X</label>
                <input
                  type="text"
                  value={profile.twitter}
                  onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                  className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="@votrecompte"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Facebook</label>
                <input
                  type="text"
                  value={profile.facebook}
                  onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                  className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="URL ou nom de page"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">LinkedIn</label>
                <input
                  type="text"
                  value={profile.linkedin}
                  onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="URL ou identifiant"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>
          </section>

          {/* Section Infos pro */}
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-800 pb-2">
              Informations professionnelles <span className="font-normal text-neutral-600">(optionnel)</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">SIRET</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={profile.siret}
                  onChange={(e) => setProfile({ ...profile, siret: e.target.value.replace(/\D/g, "").slice(0, 14) })}
                  className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="14 chiffres"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Numéro de TVA</label>
                <input
                  type="text"
                  value={profile.vatNumber}
                  onChange={(e) => setProfile({ ...profile, vatNumber: e.target.value })}
                  className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="ex. FR12345678901"
                />
              </div>
            </div>
          </section>

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
