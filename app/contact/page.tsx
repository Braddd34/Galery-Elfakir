"use client"

import { useState } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        setStatus("error")
        alert(data.error || "Une erreur est survenue")
      }
    } catch (error) {
      setStatus("error")
      alert("Une erreur est survenue")
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white pt-28">
        {/* Hero */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
              Contact
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl">
              Une question, une demande particulière ? 
              N'hésitez pas à nous contacter.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Form */}
              <div>
                <h2 className="text-2xl font-light mb-8">
                  Envoyez-nous un message
                </h2>

                {status === "success" ? (
                  <div className="bg-green-500/10 border border-green-500/50 p-8 text-center">
                    <p className="text-green-400">
                      Votre message a été envoyé avec succès !
                    </p>
                    <p className="text-neutral-500 text-sm mt-2">
                      Nous vous répondrons dans les plus brefs délais.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                        placeholder="Votre nom"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                        placeholder="votre@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                        Sujet
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        className="w-full bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                      >
                        <option value="">Sélectionnez un sujet</option>
                        <option value="artwork">Question sur une œuvre</option>
                        <option value="order">Question sur une commande</option>
                        <option value="artist">Devenir artiste</option>
                        <option value="partnership">Partenariat</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
                        Message
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={6}
                        className="w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors resize-none"
                        placeholder="Votre message..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full bg-white text-black py-4 font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                    >
                      {status === "loading" ? "Envoi..." : "Envoyer le message"}
                    </button>
                  </form>
                )}
              </div>

              {/* Info */}
              <div className="lg:pl-16">
                <h2 className="text-2xl font-light mb-8">
                  Informations
                </h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                      Email
                    </h3>
                    <a 
                      href="mailto:contact@elfakir.art" 
                      className="text-white hover:text-neutral-300 transition-colors"
                    >
                      contact@elfakir.art
                    </a>
                  </div>

                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                      Horaires
                    </h3>
                    <p className="text-neutral-400">
                      Lundi - Vendredi : 9h - 18h<br />
                      Samedi : 10h - 16h<br />
                      Dimanche : Fermé
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                      Réseaux sociaux
                    </h3>
                    <div className="flex gap-4">
                      <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                        Instagram
                      </a>
                      <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                        LinkedIn
                      </a>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-neutral-800">
                    <p className="text-neutral-500 text-sm">
                      Nous nous engageons à répondre à toutes les demandes 
                      dans un délai de 24 à 48 heures ouvrées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
