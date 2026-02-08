"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface ContactArtistButtonProps {
  artistUserId: string
  artistName: string
  artworkId?: string
  artworkTitle?: string
}

export default function ContactArtistButton({ 
  artistUserId, 
  artistName,
  artworkId,
  artworkTitle 
}: ContactArtistButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  
  const [message, setMessage] = useState({
    subject: artworkTitle ? `Question sur "${artworkTitle}"` : "",
    content: ""
  })
  
  const handleClick = () => {
    if (!session) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname))
      return
    }
    setShowModal(true)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.content.trim()) {
      setError("Veuillez écrire un message")
      return
    }
    
    setSending(true)
    setError("")
    
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: artistUserId,
          subject: message.subject || null,
          content: message.content,
          artworkId: artworkId || null
        })
      })
      
      if (res.ok) {
        setSent(true)
        setTimeout(() => {
          setShowModal(false)
          setSent(false)
          setMessage({ subject: "", content: "" })
        }, 2000)
      } else {
        const data = await res.json()
        setError(data.error || "Erreur lors de l'envoi")
      }
    } catch (err) {
      setError("Erreur réseau")
    } finally {
      setSending(false)
    }
  }
  
  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Contacter l'artiste
      </button>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                Contacter {artistName}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-neutral-800 rounded"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {sent ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-lg">Message envoyé !</p>
                <p className="text-neutral-400 text-sm mt-2">
                  {artistName} recevra votre message dans sa boîte de réception.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Objet</label>
                  <input
                    type="text"
                    value={message.subject}
                    onChange={(e) => setMessage({ ...message, subject: e.target.value })}
                    placeholder="Question, demande d'information..."
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded focus:border-white focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Message *</label>
                  <textarea
                    value={message.content}
                    onChange={(e) => setMessage({ ...message, content: e.target.value })}
                    placeholder="Votre message..."
                    rows={5}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded focus:border-white focus:outline-none resize-none"
                    required
                  />
                </div>
                
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 py-2 bg-white text-black font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                  >
                    {sending ? "Envoi..." : "Envoyer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-neutral-700 hover:border-white transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
