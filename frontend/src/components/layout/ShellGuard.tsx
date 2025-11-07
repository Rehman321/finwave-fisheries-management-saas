"use client"
import * as React from "react"
import { usePathname } from "next/navigation"
import AppShell from "./AppShell"

export default function ShellGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Routes that should render outside the dashboard shell
  const authOnlyRoutes = ["/login", "/forgot-password", "/register"]

  const isAuthRoute = pathname && authOnlyRoutes.some((p) => pathname.startsWith(p))

  if (isAuthRoute) {
    // Render children directly for auth pages (no sidebar/header)
    return <>{children}</>
  }

  // Otherwise, render inside the main AppShell
  return <AppShell>{children}</AppShell>
}
