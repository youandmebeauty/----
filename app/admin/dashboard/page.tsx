"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminRouteGuard } from "@/components/admin/admin-route-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, DollarSign, LogOut, TrendingUp, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { getProducts } from "@/lib/services/product-service"
import { getCoffrets } from "@/lib/services/coffret-service"
import { getOrders } from "@/lib/services/order-service"
import { getAnalytics } from "@/lib/services/analytics-service"
import type { Product, Order, Coffret } from "@/lib/models/models"
import type { AnalyticsPeriod } from "@/lib/services/analytics-service"
import { MetricsCard } from "@/components/admin/metrics-card"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import GoogleAnalytics from "@/components/admin/googleAnalytics"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const getCreatedAtMillis = (product: Product): number => {
  const ts: any = product.createdAt
  if (!ts) return 0
  if (typeof ts._seconds === "number") return ts._seconds * 1000
  if (typeof ts.toMillis === "function") return ts.toMillis()
  return new Date(ts).getTime() || 0
}

function DashboardContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsPeriod | null>(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsData, coffretsData, ordersData, analyticsData] = await Promise.all([
        getProducts(),
        getCoffrets(),
        getOrders(),
        getAnalytics(),
      ])

      const sortedProducts = [...productsData].sort((a, b) => getCreatedAtMillis(b) - getCreatedAtMillis(a))

      const fulfilledOrders = ordersData.filter((order) => order.status === "shipped" || order.status === "delivered")

      setStats({
        totalProducts: sortedProducts.length,
        totalOrders: ordersData.length,
        totalRevenue: fulfilledOrders.reduce((sum, order) => sum + order.total, 0),
        pendingOrders: ordersData.filter((order) => order.status === "pending").length,
      })

      setAnalytics(analyticsData)
    } catch (err) {
      console.error(err)
      toast({ title: "Erreur", description: "Échec du chargement des données du tableau de bord.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className=" h-screen bg-background z-40 flex items-center justify-center w-full">
        <LoadingAnimation size={140} className="text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4  w-full lg:w-10/12">
      <div className="relative border border-border/50 bg-gradient-to-br from-secondary/30 via-secondary/20 to-background rounded-3xl overflow-hidden min-h-[calc(100vh-2rem)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <main className="container relative mx-auto  py-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-2">Tableau de bord</h1>
              <p className="text-muted-foreground">Vue d'ensemble de votre boutique</p>
            </div>
            <Button onClick={signOut} variant="outline" className="rounded-full border-border/50 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Produits</CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-medium">{stats.totalProducts}</div>
 
              </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Commandes</CardTitle>
                <ShoppingCart className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-medium">{stats.totalOrders}</div>
 
              </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenu Total</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-medium">{stats.totalRevenue.toFixed(2)} DT</div>
                <p className="text-xs text-muted-foreground mt-1">Expédiées & Livrées uniquement</p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Commandes en Attente</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-medium">{stats.pendingOrders}</div>
 
              </CardContent>
            </Card>
          </div>
          <GoogleAnalytics />

          {analytics && (
            <div className="space-y-6 mb-12">
              <h2 className="font-serif text-2xl font-medium">Analytiques</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <MetricsCard title="Aujourd'hui" value={`${analytics.today.totalRevenue.toFixed(2)} DT`} icon={<DollarSign className="h-4 w-4" />} format="currency" />
                <MetricsCard title="Cette Semaine" value={`${analytics.week.totalRevenue.toFixed(2)} DT`} icon={<TrendingUp className="h-4 w-4" />} format="currency" />
                <MetricsCard title="Ce Mois" value={`${analytics.month.totalRevenue.toFixed(2)} DT`} icon={<BarChart3 className="h-4 w-4" />} format="currency" />
              </div>
              
              <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-xl font-medium">Ventes des 7 derniers jours</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.salesChart}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs text-muted-foreground"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        className="text-xs text-muted-foreground"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                        name="Revenu (DT)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--secondary))' }}
                        name="Commandes"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
 
        </main>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminRouteGuard>
      <DashboardContent />
    </AdminRouteGuard>
  )
}