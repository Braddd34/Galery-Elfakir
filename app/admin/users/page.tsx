"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  status: string
  createdAt: string
  lastLoginAt: string | null
  _count: {
    orders: number
    favorites: number
  }
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  ARTIST: "Artiste",
  BUYER: "Acheteur"
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Actif",
  PENDING: "En attente",
  SUSPENDED: "Suspendu",
  DELETED: "Supprimé"
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/20 text-green-400",
  PENDING: "bg-yellow-500/20 text-yellow-400",
  SUSPENDED: "bg-red-500/20 text-red-400",
  DELETED: "bg-neutral-500/20 text-neutral-400"
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  useEffect(() => {
    fetchUsers()
  }, [roleFilter, statusFilter])
  
  const fetchUsers = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      if (search) params.set("search", search)
      if (roleFilter) params.set("role", roleFilter)
      if (statusFilter) params.set("status", statusFilter)
      
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.users || [])
      setPagination(data.pagination)
    } catch (err) {
      console.error("Erreur:", err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleAction = async (userId: string, action: string, newRole?: string) => {
    if (action === "suspend" && !confirm("Confirmer la suspension de cet utilisateur ?")) return
    if (action === "delete" && !confirm("Confirmer la suppression de cet utilisateur ?")) return
    
    setActionLoading(userId)
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, newRole })
      })
      
      if (res.ok) {
        const updated = await res.json()
        setUsers(prev =>
          prev.map(u =>
            u.id === userId
              ? { ...u, role: updated.role, status: updated.status }
              : u
          )
        )
      }
    } catch (err) {
      console.error("Erreur action:", err)
    } finally {
      setActionLoading(null)
    }
  }
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers()
  }
  
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-xl tracking-[0.3em] font-light">ELFAKIR</Link>
          <Link href="/dashboard" className="text-neutral-400 hover:text-white text-sm">
            ← Retour au tableau de bord
          </Link>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-8">Gestion des utilisateurs</h1>
        
        {/* Filtres */}
        <div className="flex flex-wrap gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher nom ou email..."
              className="px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-white focus:outline-none w-64"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200"
            >
              Chercher
            </button>
          </form>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-white focus:outline-none"
          >
            <option value="">Tous les rôles</option>
            <option value="BUYER">Acheteurs</option>
            <option value="ARTIST">Artistes</option>
            <option value="ADMIN">Admins</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-white focus:outline-none"
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="PENDING">En attente</option>
            <option value="SUSPENDED">Suspendus</option>
          </select>
        </div>
        
        {/* Table */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-neutral-900 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800 text-left text-sm text-neutral-400">
                      <th className="px-6 py-4">Utilisateur</th>
                      <th className="px-6 py-4">Rôle</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4">Inscription</th>
                      <th className="px-6 py-4">Activité</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <Image
                                src={user.image}
                                alt=""
                                width={36}
                                height={36}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center">
                                <span className="text-sm">
                                  {user.name?.[0]?.toUpperCase() || "?"}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{user.name || "Sans nom"}</p>
                              <p className="text-xs text-neutral-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm">{roleLabels[user.role] || user.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded ${statusColors[user.status] || "bg-neutral-800"}`}>
                            {statusLabels[user.status] || user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-400">
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-400">
                          {user._count.orders} cmd • {user._count.favorites} fav
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {user.status === "SUSPENDED" ? (
                              <button
                                onClick={() => handleAction(user.id, "activate")}
                                disabled={actionLoading === user.id}
                                className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 disabled:opacity-50"
                              >
                                Réactiver
                              </button>
                            ) : user.status === "ACTIVE" ? (
                              <button
                                onClick={() => handleAction(user.id, "suspend")}
                                disabled={actionLoading === user.id}
                                className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 disabled:opacity-50"
                              >
                                Suspendre
                              </button>
                            ) : user.status === "PENDING" ? (
                              <button
                                onClick={() => handleAction(user.id, "activate")}
                                disabled={actionLoading === user.id}
                                className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 disabled:opacity-50"
                              >
                                Activer
                              </button>
                            ) : null}
                            
                            <select
                              value={user.role}
                              onChange={(e) => handleAction(user.id, "change_role", e.target.value)}
                              disabled={actionLoading === user.id}
                              className="text-xs px-2 py-1 bg-neutral-800 border border-neutral-700 rounded"
                            >
                              <option value="BUYER">Acheteur</option>
                              <option value="ARTIST">Artiste</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => fetchUsers(p)}
                    className={`w-10 h-10 rounded ${
                      p === pagination.page
                        ? "bg-white text-black"
                        : "bg-neutral-800 hover:bg-neutral-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
            
            <p className="text-center text-neutral-500 text-sm mt-4">
              {pagination?.totalCount || 0} utilisateur{(pagination?.totalCount || 0) > 1 ? "s" : ""} au total
            </p>
          </>
        )}
      </div>
    </main>
  )
}
