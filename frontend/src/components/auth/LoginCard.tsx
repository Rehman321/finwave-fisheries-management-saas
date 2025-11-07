import * as React from "react"
import { Card } from "@/components/ui/card"

type Props = {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export default function LoginCard({ children, title = "Welcome back", subtitle = "Sign in to your account" }: Props) {
  return (
    <Card className="w-full max-w-md p-6 sm:p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      {children}
    </Card>
  )
}
