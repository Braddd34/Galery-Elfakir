"use client"

import { useState, useRef, useEffect } from "react"
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
  const [imageLoadError, setImageLoadError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Réafficher l’image si l’URL change (ex. après nouvel upload)
  useEffect(() => {
    setImageLoadError(false)
  }, [currentImage])

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

  // URLs absolues uniquement ; les URLs S3 passent par le proxy (bucket souvent privé)
  const isValidImageUrl =
    currentImage &&
    (currentImage.startsWith("http://") || currentImage.startsWith("https://"))
  const isS3Url = isValidImageUrl && currentImage!.includes("amazonaws.com")
  const displayImage =
    isValidImageUrl && !imageLoadError
      ? isS3Url
        ? `/api/image-proxy?url=${encodeURIComponent(currentImage!)}`
        : currentImage!
      : "/avatar-placeholder.svg"

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-3">
        <img
          src={displayImage}
          alt={artistName || "Artiste"}
          className="w-16 h-16 object-cover bg-neutral-800 flex-shrink-0"
          onError={() => setImageLoadError(true)}
        />
        <div className="flex flex-col gap-1">
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
            className="text-xs text-neutral-400 hover:text-white border border-neutral-600 hover:border-neutral-500 px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            {uploading ? "Envoi..." : "Changer la photo"}
          </button>
          {error && (
            <p className="text-red-400 text-xs max-w-[200px]" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
