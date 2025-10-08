"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

interface NavItemProps {
  readonly href: string
  readonly icon: LucideIcon
  readonly label: string
  readonly onNavigate?: () => void
  readonly comingSoon?: boolean
}

export function NavItem({ href, icon: Icon, label, onNavigate, comingSoon }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  const handleClick = (e: React.MouseEvent) => {
    if (comingSoon) {
      e.preventDefault()
      return
    }

    if (isActive) {
      e.preventDefault()
      onNavigate?.()
    } else if (onNavigate) {
      onNavigate()
    }
  }

  return (
    <Link href={comingSoon ? "#" : href} className="block" onClick={handleClick}>
      <div
        className={`w-full rounded-md p-2 flex items-center gap-2 transition-colors relative ${
          isActive
            ? "bg-secondary hover:bg-secondary"
            : comingSoon
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-secondary/50 cursor-pointer"
        }`}
      >
        <Icon className={`h-5 w-5 ${comingSoon ? "blur-sm" : ""}`} />
        <span className={comingSoon ? "blur-sm select-none" : ""}>{label}</span>
        {/* </CHANGE> */}
        {comingSoon && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Soon</span>
        )}
      </div>
    </Link>
  )
}
