"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import DashboardLayout from "./dashboard-layout"

export default function ConditionalLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const pathname = usePathname()

  // Define which paths should NOT show the dashboard layout
  const isAuthPage = pathname?.startsWith("/auth")

  if (isAuthPage) {
    return <>{children}</>
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
