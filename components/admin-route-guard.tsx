"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

import { LoadingAnimation } from "@/components/ui/loading-animation"

interface AdminRouteGuardProps {
  children: React.ReactNode
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, loading, isAdmin, hasValidToken } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // If no valid token or not admin, redirect to login
      if (!hasValidToken || !isAdmin) {
        router.push("/admin/login")
      }
    }
  }, [loading, isAdmin, hasValidToken, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingAnimation size={140} className="text-primary" />
      </div>
    )
  }

  // If not authenticated, don't render children
  if (!hasValidToken || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
