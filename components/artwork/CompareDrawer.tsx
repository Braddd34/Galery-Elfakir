"use client"

import { useState, useEffect, createContext, useContext } from "react"
import Image from "next/image"
import Link from "next/link"

// Types
interface CompareArtwork {
  id: string
  title: string
  slug: string
  price: number
  year: number
  width: number
  height: number
  depth?: number | null
  medium: string
  category: string
  image: string
  artistName: string
}

interface CompareContextType {
  items: CompareArtwork[]
  addItem: (item: CompareArtwork) => void
  removeItem: (id: string) => void
  clearAll: () => void
  isInCompare: (id: string) => boolean
}

// Context
const CompareContext = createContext<CompareContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  clearAll: () => {},
  isInCompare: () => false
})

export const useCompare = () => useContext(CompareContext)

// Provider
export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareArtwork[]>([])
  
  const addItem = (item: CompareArtwork) => {
    setItems(prev => {
      if (prev.length >= 3) return prev // Max 3
      if (prev.find(i => i.id === item.id)) return prev
      return [...prev, item]
    })
  }
  
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }
  
  const clearAll = () => setItems([])
  
  const isInCompare = (id: string) => items.some(i => i.id === id)
  
  return (
    <CompareContext.Provider value={{ items, addItem, removeItem, clearAll, isInCompare }}>
      {children}
      {items.length > 0 && <CompareBar />}
    </CompareContext.Provider>
  )
}

// Barre flottante de comparaison
function CompareBar() {
  const { items, removeItem, clearAll } = useCompare()
  const [showCompare, setShowCompare] = useState(false)
  
  return (
    <>
      {/* Barre fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-700 z-50 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-400">
              {items.length}/3 œuvre{items.length > 1 ? "s" : ""} sélectionnée{items.length > 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              {items.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="w-12 h-12 bg-neutral-800 rounded overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {/* Slots vides */}
              {Array.from({ length: 3 - items.length }).map((_, i) => (
                <div key={`empty-${i}`} className="w-12 h-12 border border-dashed border-neutral-700 rounded" />
              ))}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={clearAll}
              className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Vider
            </button>
            <button
              onClick={() => setShowCompare(true)}
              disabled={items.length < 2}
              className="px-6 py-2 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Comparer ({items.length})
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal de comparaison */}
      {showCompare && <CompareModal onClose={() => setShowCompare(false)} />}
    </>
  )
}

// Modal de comparaison
function CompareModal({ onClose }: { onClose: () => void }) {
  const { items } = useCompare()
  
  // Labels catégories
  const categoryLabels: Record<string, string> = {
    PAINTING: "Peinture",
    SCULPTURE: "Sculpture",
    PHOTOGRAPHY: "Photographie",
    DRAWING: "Dessin",
    PRINT: "Estampe",
    DIGITAL: "Art numérique",
    MIXED_MEDIA: "Technique mixte",
    OTHER: "Autre"
  }
  
  const compareFields = [
    { label: "Artiste", key: "artistName" },
    { label: "Prix", key: "price", format: (v: number) => `€${v.toLocaleString("fr-FR")}` },
    { label: "Année", key: "year" },
    { label: "Catégorie", key: "category", format: (v: string) => categoryLabels[v] || v },
    { label: "Technique", key: "medium" },
    { label: "Dimensions", key: "dimensions" },
  ]
  
  return (
    <div className="fixed inset-0 bg-black/90 z-[60] overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-light">Comparaison d'œuvres</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Images */}
        <div className={`grid gap-6 mb-8 ${items.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {items.map((item) => (
            <div key={item.id}>
              <div className="aspect-[3/4] bg-neutral-900 rounded-lg overflow-hidden mb-3">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={600}
                  height={800}
                  className="w-full h-full object-cover"
                />
              </div>
              <Link
                href={`/oeuvre/${item.slug}`}
                className="text-lg font-medium hover:underline"
                onClick={onClose}
              >
                {item.title}
              </Link>
            </div>
          ))}
        </div>
        
        {/* Tableau de comparaison */}
        <div className="bg-neutral-900 rounded-lg overflow-hidden">
          {compareFields.map((field, idx) => (
            <div
              key={field.key}
              className={`grid gap-6 px-6 py-4 ${items.length === 2 ? "grid-cols-[160px_1fr_1fr]" : "grid-cols-[160px_1fr_1fr_1fr]"} ${
                idx % 2 === 0 ? "bg-neutral-900" : "bg-neutral-800/50"
              }`}
            >
              <span className="text-neutral-400 font-medium">{field.label}</span>
              {items.map((item) => {
                let value: string
                if (field.key === "dimensions") {
                  value = `${item.width} × ${item.height}${item.depth ? ` × ${item.depth}` : ""} cm`
                } else {
                  const rawValue = (item as any)[field.key]
                  value = field.format ? field.format(rawValue) : String(rawValue)
                }
                return (
                  <span key={item.id} className="text-white">{value}</span>
                )
              })}
            </div>
          ))}
        </div>
        
        {/* Actions */}
        <div className={`grid gap-6 mt-6 ${items.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/oeuvre/${item.slug}`}
              onClick={onClose}
              className="block text-center py-3 bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
            >
              Voir l'œuvre
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// Bouton "Ajouter à la comparaison" pour les cartes
export function CompareButton({ artwork }: { artwork: CompareArtwork }) {
  const { addItem, removeItem, isInCompare, items } = useCompare()
  const inCompare = isInCompare(artwork.id)
  
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (inCompare) {
          removeItem(artwork.id)
        } else {
          addItem(artwork)
        }
      }}
      disabled={!inCompare && items.length >= 3}
      className={`p-1.5 rounded transition-colors ${
        inCompare 
          ? "text-white bg-white/20" 
          : "text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
      }`}
      title={inCompare ? "Retirer de la comparaison" : "Comparer"}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </button>
  )
}
