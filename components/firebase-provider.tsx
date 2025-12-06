"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { LoadingAnimation } from "@/components/ui/loading-animation"

interface FirebaseProviderProps {
  children: React.ReactNode
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize Firebase on client side
    const initFirebase = async () => {
      try {
        if (typeof window !== "undefined") {
          // Import Firebase modules
          await import("@/lib/firebase")
          setIsInitialized(true)
        }
      } catch (error) {
        console.error("Error initializing Firebase:", error)
        setIsInitialized(true) // Still render children even if Firebase fails
      }
    }

    initFirebase()
  }, [])

  // Show loading state while Firebase initializes
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingAnimation size={140} className="text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
