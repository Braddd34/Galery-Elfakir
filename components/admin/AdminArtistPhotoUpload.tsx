"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

interface AdminArtistPhotoUploadProps {
  artistId: string
  currentImage?: string | null
  artistName?: string | null
}

/**
 * Composant pour que l'admin puisse changer la photo d'un artiste.
 * Utilise le même flux d'upload (S3) que le profil artiste, puis appelle l'API admin.
 */
export default function AdminArtistPhotoUpload({
  artistId,
  currentImage,
  artistName,
}: AdminArtistPhotoUploadProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")

    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image trop volumineuse (max 5MB)")
      return
    }

    setUploading(true)
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: `profile-${Date.now()}-${file.name}`,
          contentType: file.type,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de l'upload")
      }

      const { signedUrl, publicUrl } = await response.json()

      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })

      if (!uploadResponse.ok) {
        throw new Error("Erreur lors de l'upload de l'image")
      }

      const updateResponse = await fetch(
        `/api/admin/artists/${artistId}/profile-photo`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: publicUrl }),
        }
      )

      if (!updateResponse.ok) {
        const data = await updateResponse.json()
        throw new Error(data.error || "Erreur lors de la mise à jour")
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const displayImage = currentImage || "/avatar-placeholder.svg"

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <img
          src={displayImage}
          alt={artistName || "Artiste"}
          className="w-16 h-16 object-cover bg-neutral-800"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 hover:opacity-100 transition-opacity text-xs text-white"
        >
          {uploading ? "..." : "Changer"}
        </button>
      </div>
      {error && (
        <p className="text-red-400 text-xs max-w-[180px]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
