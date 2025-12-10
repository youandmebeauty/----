"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { NavigationLoading } from "./navigation-loading"
import { SplashScreen } from "./splash-screen"

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  showSplash: boolean
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider")
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  // Handle route changes
  useEffect(() => {
    // Skip if splash screen is still showing
    if (showSplash) return

    // Show loading when route starts changing
    setIsLoading(true)

    // Hide loading after a short delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname, searchParams, showSplash])

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, showSplash }}>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <NavigationLoading isLoading={isLoading && !showSplash} />
      {children}
    </LoadingContext.Provider>
  )
}
