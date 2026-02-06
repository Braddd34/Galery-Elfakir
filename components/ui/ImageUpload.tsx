"use client"

import { useState, useRef } from "react"

interface ImageUploadProps {
  images: { url: string; key?: string }[]
  onChange: (images: { url: string; key?: string }[]) => void
  maxImages?: number
  disabled?: boolean
}

export default function ImageUpload({ images, onChange, maxImages = 5, disabled = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError("")
    setUploading(true)

    try {
      const newImages: { url: string; key?: string }[] = []

      for (const file of Array.from(files)) {
        // Vérifier la taille (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError("Image trop volumineuse (max 10MB)")
          continue
        }

        // Obtenir l'URL signée
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || "Erreur lors de l'upload")
          continue
        }

        const { signedUrl, publicUrl, key } = await response.json()

        // Uploader directement vers S3
        const uploadResponse = await fetch(signedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        })

        if (uploadResponse.ok) {
          newImages.push({ url: publicUrl, key })
        } else {
          setError("Erreur lors de l'upload de l'image")
        }
      }

      // Ajouter les nouvelles images (max)
      const updatedImages = [...images, ...newImages].slice(0, maxImages)
      onChange(updatedImages)
    } catch (err) {
      setError("Erreur lors de l'upload")
      console.error(err)
    } finally {
      setUploading(false)
      // Reset l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Images existantes */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square bg-neutral-900">
              <img
                src={image.url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {!disabled && (
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 w-8 h-8 bg-black/70 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              )}
              {index === 0 && (
                <span className="absolute bottom-2 left-2 bg-white text-black text-xs px-2 py-1">
                  Principale
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Zone d'upload */}
      {images.length < maxImages && !disabled && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-neutral-700 p-8 text-center cursor-pointer hover:border-neutral-500 transition-colors ${
            uploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-neutral-400">Upload en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg className="w-10 h-10 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-neutral-400">
                Cliquez pour ajouter des images
              </p>
              <p className="text-neutral-600 text-sm">
                JPG, PNG, WebP ou GIF (max 10MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Erreur */}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Info */}
      <p className="text-neutral-600 text-sm">
        {images.length}/{maxImages} images • La première image sera l'image principale
      </p>
    </div>
  )
}
