import * as React from "react"
import LoginCard from "@/components/auth/LoginCard"
import LoginForm from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <div className="h-screen w-screen flex flex-row">
      {/* Logo/Brand section - Left half */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary/20 to-accent/20 items-center justify-center">
        <div className="w-full max-w-full px-8">
          <h1 className="text-5xl font-bold mb-4 text-center">FinWave</h1>
          <p className="text-xl text-muted-foreground text-center">Fisheries management platform</p>
          <div className="mt-12 w-full aspect-square max-w-md mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40%" height="40%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M2 5h20M2 19h20M5 12h14"></path>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Login form section - Right half */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="w-full px-8 md:px-12 lg:px-16">
          <div className="mb-8 md:hidden text-center">
            <h2 className="text-3xl font-semibold">FinWave</h2>
            <p className="text-sm text-muted-foreground mt-1">Fisheries management dashboard</p>
          </div>
          <LoginCard>
            <LoginForm />
          </LoginCard>
        </div>
      </div>
    </div>
  )
}
