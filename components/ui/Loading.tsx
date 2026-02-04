// Spinner de chargement
export function Spinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3"
  }

  return (
    <div
      className={`${sizeClasses[size]} border-neutral-700 border-t-white rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Chargement"
    />
  )
}

// Page de chargement plein écran
export function PageLoader() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-neutral-500 text-sm tracking-wider">Chargement...</p>
      </div>
    </div>
  )
}

// Skeleton pour une carte d'œuvre
export function ArtworkCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-neutral-800 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-neutral-800 w-1/3" />
        <div className="h-5 bg-neutral-800 w-2/3" />
        <div className="h-4 bg-neutral-800 w-1/2" />
        <div className="h-5 bg-neutral-800 w-1/4 mt-2" />
      </div>
    </div>
  )
}

// Skeleton pour une grille d'œuvres
export function ArtworkGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
      {Array.from({ length: count }).map((_, i) => (
        <ArtworkCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Skeleton pour un texte
export function TextSkeleton({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-neutral-800 animate-pulse"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  )
}

// Bouton avec état de chargement
export function LoadingButton({
  loading,
  children,
  className = "",
  ...props
}: {
  loading: boolean
  children: React.ReactNode
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`relative ${className} ${loading ? "text-transparent" : ""}`}
    >
      {children}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" />
        </div>
      )}
    </button>
  )
}
