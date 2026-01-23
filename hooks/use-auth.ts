"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "./use-toast"
import type { Auth } from "firebase/auth"

import type { User } from "firebase/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const [authServices, setAuthServices] = useState<{
    auth: any
    signInWithEmailAndPassword: any
    signOut: any
    onAuthStateChanged: any
  } | null>(null)

useEffect(() => {
  let unsubscribe: (() => void) | null = null
  let mounted = true
  let refreshInterval: NodeJS.Timeout | null = null

  const initAuth = async () => {
    try {
      if (typeof window === "undefined") return

      const [{ auth }, { signInWithEmailAndPassword, signOut, onAuthStateChanged }] = await Promise.all([
        import("@/lib/firebase") as Promise<{ auth: Auth }>,
        import("firebase/auth"),
      ])

      if (!mounted) return

      setAuthServices({ auth, signInWithEmailAndPassword, signOut, onAuthStateChanged })

      unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
        if (!mounted) return

        if (user) {
          const token = await user.getIdToken()
          document.cookie = `admin-token=${token}; path=/; max-age=3600; secure; samesite=strict`

          const idTokenResult = await user.getIdTokenResult()
          const isAdmin = idTokenResult.claims.admin === true

          if (isAdmin) {
            setUser(user)
            
            // Clear any existing interval
            if (refreshInterval) clearInterval(refreshInterval)
            
            // Auto-refresh token every 50 minutes (before 1-hour expiry)
            refreshInterval = setInterval(async () => {
              try {
                const newToken = await user.getIdToken(true) // Force refresh
                document.cookie = `admin-token=${newToken}; path=/; max-age=3600; secure; samesite=strict`
                console.log('Token refreshed successfully')
              } catch (error) {
                console.error('Token refresh failed:', error)
                clearInterval(refreshInterval!)
                // Optionally sign out user if refresh fails
                toast({
                  title: "Session Error",
                  description: "Failed to refresh session. Please log in again.",
                  variant: "destructive",
                })
              }
            }, 50 * 60 * 1000) // 50 minutes
          } else {
            await signOut(auth)
            setUser(null)
            toast({
              title: "Access Denied",
              description: "You don't have admin privileges.",
              variant: "destructive",
            })
          }
        } else {
          // Clear refresh interval on sign out
          if (refreshInterval) {
            clearInterval(refreshInterval)
            refreshInterval = null
          }
          document.cookie = "admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          setUser(null)
        }

        setLoading(false)
      })
    } catch (err) {
      console.error("Auth initialization failed:", err)
      setLoading(false)
    }
  }

  initAuth()

  return () => {
    mounted = false
    if (unsubscribe) unsubscribe()
    if (refreshInterval) clearInterval(refreshInterval)
  }
}, [toast])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!authServices) {
      toast({
        title: "Authentication Error",
        description: "Authentication service is not available.",
        variant: "destructive",
      })
      return false
    }

    const { auth, signInWithEmailAndPassword, signOut } = authServices

    try {
      setLoading(true)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const idTokenResult = await userCredential.user.getIdTokenResult()
      const isAdmin = idTokenResult.claims.admin === true

      if (!isAdmin) {
        await signOut(auth)
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard.",
      })
      router.push("/admin/dashboard")
      return true
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error?.message || "Invalid email or password.",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [authServices, router, toast])

  const signOutUser = useCallback(async () => {
    if (!authServices) return

    try {
      await authServices.signOut(authServices.auth)
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin dashboard.",
      })
      router.push("/admin/login")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to log out.",
        variant: "destructive",
      })
    }
  }, [authServices, toast, router])

  const hasValidToken = useMemo(() => {
    if (typeof window === "undefined") return false
    const token = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("admin-token="))
    return !!token && token.split("=")[1].trim() !== ""
  }, [user])

  return {
    user,
    loading,
    signIn,
    signOut: signOutUser,
    isAdmin: !!user,
    hasValidToken,
  }
}
