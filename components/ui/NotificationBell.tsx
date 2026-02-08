"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

/**
 * Composant cloche de notifications.
 * Affiché dans le header, il montre le nombre de notifications non lues
 * et un dropdown avec la liste des notifications.
 * Les notifications sont rafraîchies toutes les 30 secondes.
 */
export default function NotificationBell() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Récupérer les notifications
  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return
    try {
      const res = await fetch("/api/notifications?limit=15")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Erreur chargement notifications:", error)
    }
  }, [session])

  // Charger les notifications au montage et toutes les 30s
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Marquer comme lu
  const markAsRead = async (notifId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notifId })
      })
      setNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  // Marquer toutes comme lues
  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true })
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  // Cliquer sur une notification
  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      await markAsRead(notif.id)
    }
    if (notif.link) {
      router.push(notif.link)
    }
    setIsOpen(false)
  }

  // Icône selon le type
  const getIcon = (type: string) => {
    switch (type) {
      case "sale": return "💰"
      case "artwork_approved": return "✅"
      case "artwork_rejected": return "❌"
      case "order_confirmed": return "🛒"
      case "order_shipped": return "📦"
      case "order_delivered": return "✨"
      case "new_follower": return "👤"
      case "new_message": return "💬"
      case "new_review": return "⭐"
      default: return "🔔"
    }
  }

  // Temps relatif
  const timeAgo = (dateStr: string) => {
    const now = Date.now()
    const date = new Date(dateStr).getTime()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes}min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days < 7) return `Il y a ${days}j`
    return new Date(dateStr).toLocaleDateString("fr-FR")
  }

  if (!session?.user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-neutral-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Badge non lu */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-subtle">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] bg-neutral-900 border border-neutral-700 shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <h3 className="text-sm font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-gold hover:text-white transition-colors"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left p-4 border-b border-neutral-800 hover:bg-neutral-800 transition-colors ${
                    !notif.read ? "bg-neutral-800/50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notif.read ? "text-white font-medium" : "text-neutral-300"}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-gold rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-neutral-600 mt-1">
                        {timeAgo(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-neutral-500 text-sm">
                Aucune notification
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
