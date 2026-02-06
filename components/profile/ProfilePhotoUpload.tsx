"use client"

import { useState, useRef } from "react"
import Image from "next/image"

interface ProfilePhotoUploadProps {
  currentImage?: string | null
  userName?: string | null
  onPhotoChange: (url: string) => void
}

export default function ProfilePhotoUpload({ 
  currentImage, 
  userName,
  onPhotoChange 
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")

    // Vérifier le type
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image")
      return
    }

    // Vérifier la taille (max 5MB pour les photos de profil)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image trop volumineuse (max 5MB)")
      return
    }

    // Afficher un aperçu
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)

    try {
      // Obtenir l'URL signée pour S3
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

      // Uploader vers S3
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error("Erreur lors de l'upload de l'image")
      }

      // Mettre à jour le profil avec la nouvelle photo
      const updateResponse = await fetch("/api/user/profile-photo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: publicUrl }),
      })

      if (!updateResponse.ok) {
        throw new Error("Erreur lors de la mise à jour du profil")
      }

      onPhotoChange(publicUrl)
      setPreview(null)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload")
      setPreview(null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const displayImage = preview || currentImage
  const initials = userName?.charAt(0).toUpperCase() || "?"

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Photo actuelle ou initiale */}
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center">
          {displayImage ? (
            <Image
              src={displayImage}
              alt="Photo de profil"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl text-neutral-400">{initials}</span>
          )}
        </div>

        {/* Overlay au hover */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          aria-label="Changer la photo de profil"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Sélectionner une photo"
        />
      </div>

      {/* Texte d'aide */}
      <div className="text-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-sm text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {uploading ? "Upload en cours..." : "Changer la photo"}
        </button>
        <p className="text-xs text-neutral-600 mt-1">JPG, PNG ou WebP (max 5MB)</p>
      </div>

      {/* Erreur */}
      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}
    </div>
  )
}
