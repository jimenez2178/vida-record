'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavLink = {
  href: string
  label: string
  icon: React.ReactNode
}

export default function SidebarNav({
  links,
  onLinkClick,
}: {
  links: NavLink[]
  onLinkClick?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
      {links.map((link) => {
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-700 text-white'
                : 'text-white/90 hover:bg-blue-800'
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
