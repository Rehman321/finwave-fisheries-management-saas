"use client"
import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/auth/authContext"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/')
    }
  }, [authLoading, isAuthenticated, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsSubmitting(true);
    
    try {
      const success = await login(email, password)
      
      if (success) {
        router.push("/")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
          {error}
        </div>
      )}
      
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@company.com"
          required
          className="mt-2"
          disabled={isSubmitting || authLoading}
        />
      </label>

      <label className="block">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Password</span>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Your password"
          required
          className="mt-2"
          disabled={isSubmitting || authLoading}
        />
      </label>

      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </div>
      
      <div className="text-center text-sm text-muted-foreground mt-4">
        <p>Demo credentials: admin@finwave.com / password</p>
      </div>
    </form>
  )
}
