import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="border-b border-neutral-800/50">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-4">
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/" className="hover:text-white transition-colors">
            Accueil
          </Link>
          {items.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {item.href ? (
                <Link href={item.href} className="hover:text-white transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-white">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  )
}
