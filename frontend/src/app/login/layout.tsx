import type { ReactNode } from "react";

export const metadata = {
  title: "Sign in - FinWave",
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  // Nested layout: don't include <html> / <body> here — root layout already provides them.
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {children}
    </div>
  )
}
