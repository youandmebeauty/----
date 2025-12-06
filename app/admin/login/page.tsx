"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const { signIn, loading, isAdmin, hasValidToken } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isAdmin && hasValidToken) {
      router.push("/admin/dashboard")
    }
  }, [loading, isAdmin, hasValidToken, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn(credentials.email, credentials.password)
  }

  // Show loading if checking auth status
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If already authenticated, show redirect message
  if (isAdmin && hasValidToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Déjà connecté</h1>
          <p className="text-muted-foreground">Redirection vers le tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>

      <Card className="w-full max-w-md bg-background/50 backdrop-blur-sm border-border/50 shadow-lg relative z-10">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-24 h-24 relative mb-4">
            <img
              src="/logo-light.webp"
              alt="you&me Beauty Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <CardTitle className="font-serif text-3xl font-medium tracking-tight">Connexion Admin</CardTitle>
          <p className="text-sm text-muted-foreground">Accédez à votre tableau de bord</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
                required
                className="bg-background/50"
                placeholder="admin@youme-beauty.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                required
                className="bg-background/50"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full rounded-full h-11 text-base" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
