"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Package, ShoppingCart, Users, DollarSign, LogOut, TrendingUp, BarChart3 } from "lucide-react"
import { getProducts } from "@/lib/services/product-service"
import { getOrders, updateOrderStatus } from "@/lib/services/order-service"
import { getAnalytics } from "@/lib/services/analytics-service"
import type { Product, Order } from "@/lib/models"
import type { AnalyticsPeriod } from "@/lib/services/analytics-service"
import { MetricsCard } from "@/components/admin/metrics-card"
import { AnalyticsChart } from "@/components/admin/analytics-chart"
import { LoadingAnimation } from "@/components/ui/loading-animation"
function DashboardContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { signOut } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsPeriod | null>(null)
  const [loading, setLoading] = useState(true)
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

      // Fetch products, orders, and analytics from Firebase
      const [productsData, ordersData, analyticsData] = await Promise.all([
        getProducts(),
        getOrders(),
        getAnalytics(),
      ])

      setProducts(productsData)
      setOrders(ordersData)
      setAnalytics(analyticsData)

      // Calculate stats
      setStats({
        totalProducts: productsData.length,
        totalOrders: ordersData.length,
        totalRevenue: ordersData.reduce((sum, order) => sum + order.total, 0),
        pendingOrders: ordersData.filter((order) => order.status === "pending").length,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Erreur",
        description: "Échec du chargement des données du tableau de bord.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await updateOrderStatus(orderId, newStatus)

      // Update local state
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

      // Update pending orders count
      setStats((prev) => ({
        ...prev,
        pendingOrders: orders.filter((order) =>
          order.id === orderId ? newStatus === "pending" : order.status === "pending",
        ).length,
      }))

      toast({
        title: "Commande mise à jour",
        description: `Statut de la commande changé en ${newStatus}.`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour du statut de la commande.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingAnimation size={140} className="text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="relative border border-border/50 bg-gradient-to-br from-secondary/30 via-secondary/20 to-background rounded-3xl overflow-hidden min-h-[calc(100vh-2rem)]">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <main className="container relative mx-auto px-6 py-8">
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
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
                <div className="text-2xl font-serif font-medium">{stats.totalRevenue.toFixed(2)} TND</div>
              </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Commandes en Attente
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-medium">{stats.pendingOrders}</div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Section */}
          {analytics && (
            <div className="space-y-6 mb-12">
              <h2 className="font-serif text-2xl font-medium">Analytiques</h2>

              {/* Period Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricsCard
                  title="Aujourd'hui"
                  value={`${analytics.today.totalRevenue.toFixed(2)} TND`}
                  icon={<DollarSign className="h-4 w-4" />}
                  format="currency"
                />
                <MetricsCard
                  title="Cette Semaine"
                  value={`${analytics.week.totalRevenue.toFixed(2)} TND`}
                  icon={<TrendingUp className="h-4 w-4" />}
                  format="currency"
                />
                <MetricsCard
                  title="Ce Mois"
                  value={`${analytics.month.totalRevenue.toFixed(2)} TND`}
                  icon={<BarChart3 className="h-4 w-4" />}
                  format="currency"
                />
              </div>

              {/* Sales Chart */}
              <AnalyticsChart data={analytics.salesChart} title="Ventes des 7 derniers jours" />

              {/* Top Products */}
              {analytics.topProducts.length > 0 && (
                <Card className="bg-background/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Top 5 Produits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topProducts.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">{item.totalSold} vendus</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item.revenue.toFixed(2)} TND</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="orders" className="space-y-8">
            <TabsList className="bg-background/50 backdrop-blur-sm border border-border/50 p-1 rounded-full">
              <TabsTrigger value="orders" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Commandes</TabsTrigger>
              <TabsTrigger value="products" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Produits</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Commandes Récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead>ID Commande</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.length > 0 ? (
                        orders.map((order) => (
                          <TableRow key={order.id} className="hover:bg-primary/5 border-border/50 transition-colors">
                            <TableCell className="font-medium">#{order.id.slice(0, 6)}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{order.email}</TableCell>
                            <TableCell>{order.total.toFixed(2)} TND</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`rounded-full px-3 py-1 ${order.status === "pending"
                                  ? "border-destructive text-destructive bg-destructive/5"
                                  : order.status === "processing"
                                    ? "border-blue-500 text-blue-500 bg-blue-500/5"
                                    : order.status === "shipped"
                                      ? "border-orange-500 text-orange-500 bg-orange-500/5"
                                      : "border-green-500 text-green-500 bg-green-500/5"
                                  }`}
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(
                                (order?.createdAt as any)?.toDate?.() ?? order?.createdAt
                              ).toLocaleString()}
                            </TableCell>
                            <TableCell className="space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                                className="hover:bg-primary/10 hover:text-primary"
                              >
                                Voir
                              </Button>
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order["status"])}
                                className="text-sm bg-transparent border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="pending">En attente</option>
                                <option value="processing">En traitement</option>
                                <option value="shipped">Expédié</option>
                                <option value="delivered">Livré</option>
                              </select>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Aucune commande trouvée
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card className="bg-background/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-serif text-xl">Inventaire des Produits</CardTitle>
                  <Button onClick={() => router.push("/admin/products/new")} className="rounded-full">Ajouter un Produit</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead>ID Produit</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.length > 0 ? (
                        products.map((product) => (
                          <TableRow key={product.id} className="hover:bg-primary/5 border-border/50 transition-colors">
                            <TableCell className="font-medium">#{product.id.slice(0, 6)}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell className="capitalize">
                              <Badge variant="secondary" className="rounded-full font-normal">
                                {product.category}
                              </Badge>
                            </TableCell>
                            <TableCell>{product.price.toFixed(2)} TND</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`rounded-full px-3 py-1 ${product.stock > 10
                                  ? "border-green-500 text-green-500 bg-green-500/5"
                                  : product.stock > 0
                                    ? "border-orange-500 text-orange-500 bg-orange-500/5"
                                    : "border-destructive text-destructive bg-destructive/5"
                                  }`}
                              >
                                {product.stock > 10 ? "En stock" : product.stock > 0 ? "Stock faible" : "Rupture de stock"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                                className="hover:bg-primary/10 hover:text-primary"
                              >
                                Modifier
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Aucun produit trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
