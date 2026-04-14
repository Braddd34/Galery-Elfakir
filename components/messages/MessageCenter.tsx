"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useToast } from "@/lib/toast-context"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface Message {
  id: string
  subject: string | null
  content: string
  read: boolean
  readAt: string | null
  artworkId: string | null
  createdAt: string
  sender: {
    id: string
    name: string | null
    image: string | null
    role: string
  }
  receiver: {
    id: string
    name: string | null
    image: string | null
    role: string
  }
}

interface MessageCenterProps {
  onUnreadCountChange?: (count: number) => void
}

export default function MessageCenter({ onUnreadCountChange }: MessageCenterProps) {
  const { data: session } = useSession()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  
  // Formulaire nouveau message
  const [newMessage, setNewMessage] = useState({
    receiverId: "",
    subject: "",
    content: ""
  })
  const [sending, setSending] = useState(false)
  
  useEffect(() => {
    fetchMessages()
  }, [activeTab])
  
  useEffect(() => {
    onUnreadCountChange?.(unreadCount)
  }, [unreadCount, onUnreadCountChange])

  // Fermer la modale de composition avec Escape
  useEffect(() => {
    if (!showCompose) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowCompose(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showCompose])
  
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?type=${activeTab}`)
      if (!res.ok) return
      const data = await res.json()
      setMessages(data.messages || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      console.error("Erreur chargement messages:", err)
    } finally {
      setLoading(false)
    }
  }
  
  const openMessage = async (message: Message) => {
    setSelectedMessage(message)
    
    // Marquer comme lu si nécessaire
    if (!message.read && message.receiver.id === session?.user?.id) {
      await fetch(`/api/messages/${message.id}`)
      setUnreadCount(prev => Math.max(0, prev - 1))
      setMessages(prev => 
        prev.map(m => m.id === message.id ? { ...m, read: true } : m)
      )
    }
  }
  
  const deleteMessage = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return
    
    try {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" })
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id))
        if (selectedMessage?.id === id) {
          setSelectedMessage(null)
        }
        showToast(t("messages.deleted"), "info")
      } else {
        showToast("Erreur lors de la suppression", "error")
      }
    } catch (err) {
      showToast("Erreur réseau", "error")
    }
  }
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.receiverId || !newMessage.content.trim()) {
      return
    }
    
    setSending(true)
    
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage)
      })
      
      if (res.ok) {
        setShowCompose(false)
        setNewMessage({ receiverId: "", subject: "", content: "" })
        showToast(t("messages.sentSuccess"), "success")
        if (activeTab === "sent") {
          fetchMessages()
        }
      } else {
        const data = await res.json()
        showToast(data.error || "Erreur lors de l'envoi", "error")
      }
    } catch (err) {
      showToast("Erreur réseau", "error")
    } finally {
      setSending(false)
    }
  }
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    } else if (days === 1) {
      return "Hier"
    } else if (days < 7) {
      return date.toLocaleDateString("fr-FR", { weekday: "long" })
    } else {
      return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    }
  }
  
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-neutral-800 rounded-lg" />
        ))}
      </div>
    )
  }
  
  return (
    <div className="min-h-[500px]">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("received")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "received"
                ? "bg-white text-black"
                : "bg-neutral-800 text-white hover:bg-neutral-700"
            }`}
          >
            {t("messages.received")}
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "sent"
                ? "bg-white text-black"
                : "bg-neutral-800 text-white hover:bg-neutral-700"
            }`}
          >
            {t("messages.sent")}
          </button>
        </div>
        
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("messages.new")}
        </button>
      </div>
      
      {/* Liste des messages / Message sélectionné */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Liste */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">
              {t("messages.noMessages")}
            </p>
          ) : (
            messages.map((message) => {
              const otherUser = activeTab === "received" ? message.sender : message.receiver
              return (
                <button
                  key={message.id}
                  onClick={() => openMessage(message)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedMessage?.id === message.id
                      ? "bg-neutral-700"
                      : message.read || activeTab === "sent"
                        ? "bg-neutral-900 hover:bg-neutral-800"
                        : "bg-neutral-800 hover:bg-neutral-700 border-l-2 border-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {otherUser.image ? (
                      <Image
                        src={otherUser.image}
                        alt={`Photo de ${otherUser.name || "l'utilisateur"}`}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center">
                        <span className="text-sm">
                          {otherUser.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium truncate ${!message.read && activeTab === "received" ? "text-white" : ""}`}>
                          {otherUser.name || t("messages.user")}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-400 truncate">
                        {message.subject || message.content}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
        
        {/* Détail du message */}
        <div className="bg-neutral-900 rounded-lg p-6">
          {selectedMessage ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {(activeTab === "received" ? selectedMessage.sender : selectedMessage.receiver).image ? (
                    <Image
                      src={(activeTab === "received" ? selectedMessage.sender : selectedMessage.receiver).image!}
                      alt={`Photo de ${(activeTab === "received" ? selectedMessage.sender : selectedMessage.receiver).name || "l'utilisateur"}`}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center">
                      <span className="text-lg">
                        {(activeTab === "received" ? selectedMessage.sender : selectedMessage.receiver).name?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {(activeTab === "received" ? selectedMessage.sender : selectedMessage.receiver).name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {new Date(selectedMessage.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              {selectedMessage.subject && (
                <h3 className="text-lg font-medium mb-3">{selectedMessage.subject}</h3>
              )}
              
              <p className="text-neutral-300 whitespace-pre-wrap">
                {selectedMessage.content}
              </p>
              
              {activeTab === "received" && (
                <button
                  onClick={() => {
                    setNewMessage({
                      receiverId: selectedMessage.sender.id,
                      subject: selectedMessage.subject ? `Re: ${selectedMessage.subject}` : "",
                      content: ""
                    })
                    setShowCompose(true)
                  }}
                  className="mt-6 px-4 py-2 bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
                >
                  Répondre
                </button>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-500">
              {t("messages.selectMessage")}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal nouveau message */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowCompose(false)}>
          <div className="bg-neutral-900 rounded-lg p-6 max-w-lg w-full" role="dialog" aria-modal="true" aria-label={t("messages.newMessage")} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{t("messages.newMessage")}</h3>
              <button
                onClick={() => setShowCompose(false)}
                className="p-2 hover:bg-neutral-800 rounded"
                aria-label="Fermer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={sendMessage} className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">{t("messages.recipientId")}</label>
                <input
                  type="text"
                  value={newMessage.receiverId}
                  onChange={(e) => setNewMessage({ ...newMessage, receiverId: e.target.value })}
                  placeholder={t("messages.recipientPlaceholder")}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded focus:border-white focus:outline-none"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  {t("messages.recipientHelp")}
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-1">{t("messages.subjectOptional")}</label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  placeholder={t("messages.subjectPlaceholder")}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded focus:border-white focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-1">{t("messages.message")}</label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  placeholder={t("messages.messagePlaceholder")}
                  rows={5}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded focus:border-white focus:outline-none resize-none"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 py-2 bg-white text-black font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {sending ? t("messages.sending") : t("messages.send")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 border border-neutral-700 hover:border-white transition-colors"
                >
                  {t("messages.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
