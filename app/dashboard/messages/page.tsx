import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import MessageCenter from "@/components/messages/MessageCenter"
import { getServerTranslation } from "@/lib/i18n-server"

export const metadata = {
  title: "Mes messages",
}

export default async function MessagesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const t = getServerTranslation()

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-xl tracking-[0.3em] font-light">
            ELFAKIR
          </Link>
          <Link href="/dashboard" className="text-neutral-400 hover:text-white text-sm">
            {t("dashboard.backToDashboard")}
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-8">{t("messages.title")}</h1>
        
        <MessageCenter />
      </div>
    </main>
  )
}
